export const PHOTO_TYPES = ["Front of face", "Right side of face", "Left side of face", "Photo ID"];

export const FRONT_FACE = {
  type: 'Front of face',
  imageTag: 'imageCaptureFrontFaceBase64',
  text: 'front of your face',
  confirmationText: 'Great, now the left side!',
  alt: 'selfie',
  field: 'imageCaptureFrontFace',
};

export const LEFT_FACE = {
  type: 'Left side of face',
  imageTag: 'imageCaptureLeftFaceBase64',
  confirmationText: 'Amazing, now the right side!',
  text: 'left side of your face',
  alt: 'leftFace',
  field: 'imageCaptureLeftFace',
};

export const RIGHT_FACE = {
  type: 'Right side of face',
  imageTag: 'imageCaptureRightFaceBase64',
  confirmationText: "That's all the photos we need for now.",
  text: 'right side of your face',
  alt: 'rightFace',
  field: 'imageCaptureRightFace',
};

export const PHOTO_ID = {
  type: 'Photo ID',
  imageTag: 'imageCaptureIDCardBase64',
  confirmationText: 'Thanks for helping us verify your identity.',
  text:
    "In order to verify your identity, please provide a photo of your government-issued ID (e.g., a driver's license or state ID). Your provider will only use it to verify your identity.",
  alt: 'id',
  field: 'imageCaptureIDCard',
};

export const getVisitPhotoFile = (photoType, visit) => {
  let visitPhoto = null;
  switch (photoType) {
    case "Front of face":
      visitPhoto = visit.photoFrontFace && visit.photoFrontFace.photoFile;
      break;
    case "Left side of face":
      visitPhoto = visit.photoLeftFace && visit.photoLeftFace.photoFile;
      break;
    case "Right side of face":
      visitPhoto = visit.photoRightFace && visit.photoRightFace.photoFile;
      break;
    case "Photo ID":
      visitPhoto = visit.photoId && visit.photoId.photoFile;
      break;
  };

  return visitPhoto;
}
