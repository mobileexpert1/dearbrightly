export const reactStrapColorForEMRFlagCategory = (category) => {
    switch(category) {
      case "MEDICAL_ADMIN_ATTENTION":
        return "info"
      case "MEDICAL_PROVIDER_ATTENTION":
        return "danger"
      case "REQUIRE_PRESCRIPTION_UPDATE":
        return "warning"
      case "REQUIRE_PATIENT_PHOTOS_UPDATE":
        return "secondary"
      case "PATIENT_PHOTOS_UPDATED":
        return "success"
      case "PATIENT_MESSAGE":
        return "dark"
      case "REQUIRE_MEDICAL_ADMIN_UPDATE":
        return "warning"
      default:
        return "primary"
    }
  }

export const colorForEMRFlagCategory = (category) => {
    switch(category) {
      case "MEDICAL_ADMIN_ATTENTION":
        return "#17A2B8"
      case "MEDICAL_PROVIDER_ATTENTION":
        return "#DC3545"
      case "REQUIRE_PRESCRIPTION_UPDATE":
        return "#FFC107"
      case "REQUIRE_PATIENT_PHOTOS_UPDATE":
        return "#6C757D"
      case "PATIENT_PHOTOS_UPDATED":
        return "#28A745"
      case "PATIENT_MESSAGE":
        return "#343A40"
      default:
        return "#17A2B8"
    }
  }

// primary - #007BFF
// secondary - #17A2B8
// info - #17A2B8
// dark - #343A40
// warning - #DC3545
// secondary - #6C757D
// success - #28A745

