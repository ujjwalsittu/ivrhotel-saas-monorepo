import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getAmenities, getPropertyTypes } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@ivrhotel/ui";
import { Button } from "@ivrhotel/ui";
import { Input } from "@ivrhotel/ui";
import { Label } from "@ivrhotel/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ivrhotel/ui";
import { Textarea } from "@ivrhotel/ui";
import { Progress } from "@ivrhotel/ui";
import { Checkbox } from "@ivrhotel/ui";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { HANDLING_TYPES, BUSINESS_STRUCTURES } from "@ivrhotel/shared";

const STEPS = [
  "Basic Information",
  "Location",
  "Amenities", // New Step
  "Policies", // New Step
  "Legal Information",
  "Documents",
  "Photos",
  "Review & Submit",
];

const OnboardingWizard: React.FC = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "",
    hotelType: "", // Dynamic
    handlingType: "ROOMS",
    contactNumber: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      coordinates: { lat: 0, lng: 0 },
    },
    legalAddress: "",
    gstNumber: "",
    authorizedSignatory: {
      name: "",
      phone: "",
    },
    businessStructure: "PRIVATE_LIMITED",
    amenities: [], // New
    policies: {
      // New
      checkInTime: "12:00",
      checkOutTime: "11:00",
      cancellationPolicy: "",
      visitorPolicy: "",
      petPolicy: { allowed: false, details: "" },
      smokingPolicy: { allowed: false, details: "" },
    },
  });
  const [uploadedDocs, setUploadedDocs] = useState<any>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<any>({
    lobby: [],
    rooms: [],
    washrooms: [],
    restaurant: [],
  });

  useEffect(() => {
    fetchHotelData();
    fetchConfigData();
  }, [hotelId]);

  const fetchConfigData = async () => {
    try {
      const [types, amenities] = await Promise.all([
        getPropertyTypes(),
        getAmenities(),
      ]);
      setPropertyTypes(types);
      setAvailableAmenities(amenities);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const fetchHotelData = async () => {
    try {
      const response = await api.get(`/hotels/${hotelId}`);
      setFormData({
        ...response.data,
        // Ensure policies object exists if not returned by API
        policies: response.data.policies || {
          checkInTime: "12:00",
          checkOutTime: "11:00",
          cancellationPolicy: "",
          visitorPolicy: "",
          petPolicy: { allowed: false, details: "" },
          smokingPolicy: { allowed: false, details: "" },
        },
      });

      // Load uploaded files and flatten nested structure
      if (response.data.documents) {
        const docs: any = {};

        const flattenDocs = (obj: any, prefix = "") => {
          Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === "object" && "url" in value) {
              docs[newKey] = value.url;
            } else if (value && typeof value === "object") {
              flattenDocs(value, newKey);
            }
          });
        };

        flattenDocs(response.data.documents);
        setUploadedDocs(docs);
      }

      if (response.data.photos) {
        setUploadedPhotos(response.data.photos);
      }
    } catch (error) {
      console.error("Error fetching hotel data:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split(".");
    if (keys.length === 1) {
      setFormData({ ...formData, [field]: value });
    } else {
      const updated = { ...formData };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        // Create nested object if it doesn't exist
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setFormData(updated);
    }
  };

  const saveProgress = async () => {
    try {
      await api.put(`/hotels/${hotelId}/onboarding`, formData);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleFileUpload = async (
    category: string,
    documentType: string,
    files: File[]
  ) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("documentType", documentType);

      try {
        const response = await api.post(
          `/hotels/${hotelId}/onboarding/upload`,
          formData
        );

        if (category === "photos") {
          setUploadedPhotos({
            ...uploadedPhotos,
            [documentType]: [
              ...(uploadedPhotos[documentType] || []),
              response.data.url,
            ],
          });
        } else {
          setUploadedDocs({
            ...uploadedDocs,
            [documentType]: response.data.url,
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await saveProgress();
      await api.post(`/hotels/${hotelId}/onboarding/submit`);
      alert("Onboarding submitted for review!");
      navigate(`/hotel/${hotelId}/dashboard`);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit onboarding");
    }
  };

  const nextStep = async () => {
    await saveProgress();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hotel Onboarding</h1>
        <p className="text-muted-foreground">Complete your hotel setup</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>{STEPS[currentStep]}</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progress} />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hotel Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hotel Type</Label>
                  <Select
                    value={formData.hotelType}
                    onValueChange={(val) => handleInputChange("hotelType", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Handling Type</Label>
                  <Select
                    value={formData.handlingType}
                    onValueChange={(val) =>
                      handleInputChange("handlingType", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HANDLING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* ... existing location fields ... */}
              <div>
                <Label>Street Address</Label>
                <Input
                  value={formData.address.street}
                  onChange={(e) =>
                    handleInputChange("address.street", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      handleInputChange("address.city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.address.state}
                    onChange={(e) =>
                      handleInputChange("address.state", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Zip Code</Label>
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      handleInputChange("address.zipCode", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) =>
                      handleInputChange("address.country", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.address.coordinates?.lat || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "address.coordinates.lat",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.address.coordinates?.lng || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "address.coordinates.lng",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Amenities */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Select Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableAmenities.map((amenity) => (
                  <div
                    key={amenity._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={amenity._id}
                      checked={formData.amenities?.includes(amenity._id)}
                      onCheckedChange={(checked) => {
                        const current = formData.amenities || [];
                        if (checked) {
                          handleInputChange("amenities", [
                            ...current,
                            amenity._id,
                          ]);
                        } else {
                          handleInputChange(
                            "amenities",
                            current.filter((id: string) => id !== amenity._id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={amenity._id} className="cursor-pointer">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Policies */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Time</Label>
                  <Input
                    type="time"
                    value={formData.policies?.checkInTime}
                    onChange={(e) =>
                      handleInputChange("policies.checkInTime", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Check-out Time</Label>
                  <Input
                    type="time"
                    value={formData.policies?.checkOutTime}
                    onChange={(e) =>
                      handleInputChange("policies.checkOutTime", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Cancellation Policy</Label>
                <Textarea
                  value={formData.policies?.cancellationPolicy}
                  onChange={(e) =>
                    handleInputChange(
                      "policies.cancellationPolicy",
                      e.target.value
                    )
                  }
                  placeholder="Enter cancellation terms..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <Label className="text-base">Pets Allowed</Label>
                    <p className="text-sm text-muted-foreground">
                      Do you allow pets in the property?
                    </p>
                  </div>
                  <Checkbox
                    checked={formData.policies?.petPolicy?.allowed}
                    onCheckedChange={(checked) =>
                      handleInputChange("policies.petPolicy", {
                        ...formData.policies.petPolicy,
                        allowed: checked,
                      })
                    }
                  />
                </div>
                {formData.policies?.petPolicy?.allowed && (
                  <Input
                    placeholder="Pet policy details (e.g., extra charges, restrictions)"
                    value={formData.policies?.petPolicy?.details}
                    onChange={(e) =>
                      handleInputChange("policies.petPolicy", {
                        ...formData.policies.petPolicy,
                        details: e.target.value,
                      })
                    }
                  />
                )}

                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <Label className="text-base">Smoking Allowed</Label>
                    <p className="text-sm text-muted-foreground">
                      Is smoking permitted in rooms?
                    </p>
                  </div>
                  <Checkbox
                    checked={formData.policies?.smokingPolicy?.allowed}
                    onCheckedChange={(checked) =>
                      handleInputChange("policies.smokingPolicy", {
                        ...formData.policies.smokingPolicy,
                        allowed: checked,
                      })
                    }
                  />
                </div>
                {formData.policies?.smokingPolicy?.allowed && (
                  <Input
                    placeholder="Smoking policy details"
                    value={formData.policies?.smokingPolicy?.details}
                    onChange={(e) =>
                      handleInputChange("policies.smokingPolicy", {
                        ...formData.policies.smokingPolicy,
                        details: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4: Legal Information */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>GST Number</Label>
                <Input
                  value={formData.gstNumber}
                  onChange={(e) =>
                    handleInputChange("gstNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Legal Address</Label>
                <Textarea
                  value={formData.legalAddress}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("legalAddress", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Authorized Signatory Name</Label>
                  <Input
                    value={formData.authorizedSignatory.name}
                    onChange={(e) =>
                      handleInputChange(
                        "authorizedSignatory.name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Signatory Phone</Label>
                  <Input
                    value={formData.authorizedSignatory.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "authorizedSignatory.phone",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Business Structure</Label>
                <Select
                  value={formData.businessStructure}
                  onValueChange={(val) =>
                    handleInputChange("businessStructure", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_STRUCTURES.map((struct) => (
                      <SelectItem key={struct.value} value={struct.value}>
                        {struct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label>GST Certificate</Label>
                <FileUpload
                  accept=".pdf,image/*"
                  onUpload={(files) =>
                    handleFileUpload("documents", "gstCertificate", files)
                  }
                  uploadedFiles={
                    uploadedDocs.gstCertificate
                      ? [uploadedDocs.gstCertificate]
                      : []
                  }
                  category="gstCertificate"
                />
              </div>
              <div>
                <Label>Cancelled Cheque</Label>
                <FileUpload
                  accept=".pdf,image/*"
                  onUpload={(files) =>
                    handleFileUpload("documents", "cancelledCheque", files)
                  }
                  uploadedFiles={
                    uploadedDocs.cancelledCheque
                      ? [uploadedDocs.cancelledCheque]
                      : []
                  }
                  category="cancelledCheque"
                />
              </div>
              <div>
                <Label>Business PAN</Label>
                <FileUpload
                  accept=".pdf,image/*"
                  onUpload={(files) =>
                    handleFileUpload(
                      "documents",
                      "legalDocs.businessPan",
                      files
                    )
                  }
                  uploadedFiles={
                    uploadedDocs["legalDocs.businessPan"]
                      ? [uploadedDocs["legalDocs.businessPan"]]
                      : []
                  }
                  category="businessPan"
                />
              </div>
            </div>
          )}

          {/* Step 6: Photos */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <Label>Lobby Photos</Label>
                <FileUpload
                  accept="image/*"
                  multiple
                  onUpload={(files) =>
                    handleFileUpload("photos", "lobby", files)
                  }
                  uploadedFiles={uploadedPhotos.lobby || []}
                  category="lobby"
                />
              </div>
              <div>
                <Label>Room Photos</Label>
                <FileUpload
                  accept="image/*"
                  multiple
                  onUpload={(files) =>
                    handleFileUpload("photos", "rooms", files)
                  }
                  uploadedFiles={uploadedPhotos.rooms || []}
                  category="rooms"
                />
              </div>
              <div>
                <Label>Washroom Photos</Label>
                <FileUpload
                  accept="image/*"
                  multiple
                  onUpload={(files) =>
                    handleFileUpload("photos", "washrooms", files)
                  }
                  uploadedFiles={uploadedPhotos.washrooms || []}
                  category="washrooms"
                />
              </div>
            </div>
          )}

          {/* Step 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Submit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review your information and submit for verification
                </p>
                <div className="text-left space-y-2 text-sm">
                  <p>
                    <strong>Hotel Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {propertyTypes.find((t) => t.code === formData.hotelType)
                      ?.name || formData.hotelType}
                  </p>
                  <p>
                    <strong>Location:</strong> {formData.address.city},{" "}
                    {formData.address.state}
                  </p>
                  <p>
                    <strong>Amenities:</strong>{" "}
                    {formData.amenities?.length || 0} selected
                  </p>
                  <p>
                    <strong>Documents Uploaded:</strong>{" "}
                    {Object.keys(uploadedDocs).length}
                  </p>
                  <p>
                    <strong>Photos Uploaded:</strong>{" "}
                    {Object.values(uploadedPhotos).flat().length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Submit for Review</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
