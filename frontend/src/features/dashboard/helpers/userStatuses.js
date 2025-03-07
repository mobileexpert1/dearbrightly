import { store } from "src/index"
import { userActionItemText, userActionItemCTAText } from 'src/features/dashboard/constants/userActionItemText';
import { hasUnreadMessages } from 'src/features/user/selectors/userSelectors';
import {
  daysDifference,
} from 'src/common/helpers/formatTimestamp';
import {
  isOrderPendingPayment,
  isOrderPendingPhotos,
  isOrderPendingSkinProfileQuestions
} from "../../orders/helpers/orderStatuses";


// ---- Visit Statuses ---- //
export const isVisitNone = visit =>
  visit && visit.id;

export const isVisitConsentRequired = visit =>
  visit && visit.id ? (!isYearlyVisit(visit) && (visit.skinProfileStatus === 'Not Started')) : false;

export const isVisitQuestionnairePending = visit =>
  visit && visit.id ? (visit.skinProfileStatus === 'Pending Questionnaire') : false;

export const isVisitQuestionnaireComplete = visit =>
  visit && visit.id ? (visit.skinProfileStatus === 'Pending Photos' ||
    visit.skinProfileStatus === 'Complete' ||
    visit.skinProfileStatus === 'No Changes User Specified' ||
    visit.skinProfileStatus === 'No Changes No User Response') : false;

export const isVisitSkinProfileComplete = visit => {
  const skinProfileStatus = visit.skinProfileStatus ? visit.skinProfileStatus.toLowerCase().replace('_', ' ') : null;
  const visitSkinProfileComplete = visit && visit.id ? (skinProfileStatus === 'complete' ||
    skinProfileStatus === 'no changes user specified' ||
    skinProfileStatus === 'no changes no user response' ||
    skinProfileStatus === 'incomplete user response') : false;
  return visitSkinProfileComplete;
}

export const isVisitSkinProfileCompleteUserResponse = visit =>
  visit && visit.id ? (visit.skinProfileStatus === 'Complete' ||
    visit.skinProfileStatus === 'No Changes User Specified') : false;

export const isVisitPhotosRejected = visit =>
  visit && visit.id ?
  ((visit.photoRightFace && visit.photoRightFace.photoRejected === true) ||
    (visit.photoLeftFace && visit.photoLeftFace.photoRejected === true) ||
    (visit.photoFrontFace && visit.photoFrontFace.photoRejected === true)) : false;

// all photos, but the ID
export const isVisitPhotosUploadComplete = visit =>
  visit && visit.id ?
    (((visit.photoRightFace && visit.photoRightFace.photoRejected !== null) &&
      (visit.photoLeftFace && visit.photoLeftFace.photoRejected !== null) &&
      (visit.photoFrontFace && visit.photoFrontFace.photoRejected !== null)) ||
      (visit.status === 'Skin Profile Complete' && visit.skinProfileStatus === 'Complete')) : false;
;

export const isAllVisitPhotosUploadComplete = visit =>
  visit && visit.id ?
    (visit.photoRightFace && visit.photoLeftFace && visit.photoFrontFace && visit.photoId) : false;
;

export const isVisitPhotosUploadStarted = visit =>
  visit && visit.id ?
  ((visit.photoRightFace && visit.photoRightFace.photoRejected !== null) ||
    (visit.photoLeftFace && visit.photoLeftFace.photoRejected !== null) ||
    (visit.photoFrontFace && visit.photoFrontFace.photoRejected !== null)) : false;

export const isVisitPhotosPending = visit =>
  visit && visit.id ? (visit.skinProfileStatus === 'Pending Photos') : false;

export const isVisitPhotoIdUploadComplete = visit =>
  visit && visit.id ? (isYearlyVisit(visit) ? true : visit.photoId !== null) : false;

export const isVisitPhotoIdUploadRequired = visit =>
  visit && visit.id ? visit.photoFrontFace && visit.photoRightFace && visit.photoLeftFace && !visit.photoId : false;

export const isVisitPhotoIdRejected = visit =>
  visit && visit.id ? (visit.photoId && visit.photoId.photoRejected === true) : false;

export const isVisitPendingProviderReview = visit =>
  visit && visit.id ? (visit.status === 'Provider Pending Action' || visit.status === 'Pending Prescription') : false;

export const isVisitPendingUserInput = visit =>
  visit && visit.id ? (visit.status === 'Provider Awaiting User Input') : false;


export const isVisitPending = visit =>
   visit && visit.id ? (visit.status === 'Pending' ||
     visit.status === 'Skin Profile Pending' ||
     visit.status === 'Skin Profile Complete' ||
     visit.status === 'Provider Pending Action' ||
     visit.status === 'Pending Prescription' ||
     visit.status === 'Provider Awaiting User Input') :
     false;

export const isVisitExpired = visit => {
  if (visit && visit.id) {
    const currentDate = new Date();
    const visitCreatedDate = visit.createdDatetime ? new Date(visit.createdDatetime) : null;
    if (visitCreatedDate) {
      const daysDeltaVisitCreatedNextShipDate = daysDifference(visitCreatedDate, currentDate);
      if (daysDeltaVisitCreatedNextShipDate > 365) {
        return true;
      }
    }
  }
  return false;
}

// visit has been completed and the medical provider has evaluated and prescribed the patient
export const isVisitValid = visit => {
  let visitValid = true;
  if (isVisitExpired(visit)) {
    visitValid = false;
  } else {
    if (visit.status !== 'Provider Signed' && visit.status !== 'Provider Rx Submitted') {
      visitValid = false;
    }
  }
  return visitValid;
}

export const isVisitNoUserResponse = visit => {
  return visit.skinProfileStatus === 'No Changes No User Response';
}

// ---- Subscription Statuses ---- //
// no subscription
export const isSubscriptionNone = subscription => subscription ? false : true;

// no rx subscription
export const isRxSubscriptionNone = subscription => subscription && subscription.productType === 'Rx'? false : true;

// subscription active
export const isSubscriptionActive = subscription => subscription ? subscription.isActive === true : false;

// subscription paused
export const isSubscriptionPaused = subscription => subscription ? (subscription.isActive && subscription.subscriptionEditDelayInDays > 0) : false;

// ---- Rx Status ---- //
// none
export const isRxNone = user => user ? user.rxStatus === 'None' : false;

// active
export const isRxActive = user => user ? (user.rxStatus === 'Active') : false;

// expired
export const isRxExpired = user => user ? user.rxStatus === 'Expired' : false;

export const requireYearlyMedicalVisitUpdate = (subscription, visit) => {
  let requireMedicalVisit = false;

  if (!subscription || !visit) {
    return requireMedicalVisit;
  }

  const currentDate = new Date();
  const nextShipDate = subscription.currentPeriodEndDatetime ? new Date(subscription.currentPeriodEndDatetime) : null;
  const visitCreatedDate = visit.createdDatetime ? new Date(visit.createdDatetime) : null;

  if (nextShipDate && visitCreatedDate) {
    const daysDeltaNextShipDateCurrentDate = daysDifference(currentDate, nextShipDate);
    const daysDeltaVisitCreatedNextShipDate = daysDifference(visitCreatedDate, nextShipDate);

    // Criteria for displaying the notifications for yearly visit update:
    // 1. first skin profile update is sent --> delta between next ship date and today is <= 21 days
    // 2. visit will expire on the next ship date --> next ship date - visit created date delta >= 1 year
    if (daysDeltaNextShipDateCurrentDate <= 21 && daysDeltaVisitCreatedNextShipDate >= 365) {
      requireMedicalVisit = true;
    }
  }

  return requireMedicalVisit;
}

// Checks if a yearly visit is required for a particular ship date
export const isYearlyVisitRequired = (visit, shipDate) => {
  let yearlyVisitRequired = false;

  if (!shipDate || !visit || visit && !visit.id) {
    return yearlyVisitRequired;
  }

  const visitCreatedDate = visit.createdDatetime ? new Date(visit.createdDatetime) : null;
  const daysDeltaVisitCreatedNextShipDate = daysDifference(visitCreatedDate, shipDate);

  const visitValid = isVisitValid(visit);
  if (!visitValid || daysDeltaVisitCreatedNextShipDate > 365) {
    yearlyVisitRequired = true;
  }

  return yearlyVisitRequired;
}

export const isYearlyVisit = (visit) =>
  visit && visit.id ? visit.service.includes('Repeat') : false;

export const isYearlyVisitComplete = (visit) => {
  const yearlyVisit = isYearlyVisit(visit);
  const visitPendingProviderReview = isVisitPendingProviderReview(visit);
  const visitSkinProfileComplete = isVisitSkinProfileComplete(visit);
  const yearlyVisitCompleted = yearlyVisit && (visitSkinProfileComplete || visitPendingProviderReview);

  return yearlyVisitCompleted;
}

export const isUserSkinProfileActionRequired = (user, visit) => {
  const visitConsentRequired = isVisitConsentRequired(visit);
  const visitQuestionnairePending = isVisitQuestionnairePending(visit);
  const visitPhotosPending = isVisitPhotosPending(visit);
  const visitPhotosRejected = isVisitPhotosRejected(visit);
  const visitPhotoIdRejected = isVisitPhotoIdRejected(visit);

  const isActionRequired = visitConsentRequired ||
    visitQuestionnairePending ||
    visitPhotosPending ||
    visitPhotosRejected ||
    visitPhotoIdRejected;

  return isActionRequired;
}

export const isUserPendingCheckout = (order, visit) =>
{
  const visitSkinProfileComplete = isVisitSkinProfileComplete(visit);
  const pendingCheckout = isOrderPendingPayment(order) && !visitSkinProfileComplete ||    // capture payment can fail after checkout (checkout is still technically complete though)
    isOrderPendingSkinProfileQuestions(order) ||
    isOrderPendingPhotos(order);
  return pendingCheckout;
}


export const isPendingCheckoutPayment = (order) => {
  const isPendingCheckoutPayment = order ? order.status === 7 : false;
  return isPendingCheckoutPayment;
}

export const isUserActionRequired = (user, visit, subscription, pendingCheckoutOrder) => {
  const subscriptionActive = isSubscriptionActive(subscription);
  const subscriptionNone = isSubscriptionNone(subscription);
  const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit, subscription);
  const visitPhotosRejected = isVisitPhotosRejected(visit);
  const userPendingCheckout = isUserPendingCheckout(pendingCheckoutOrder, visit);
  const rxOrderPendingCheckout = pendingCheckoutOrder && pendingCheckoutOrder.orderType === 'Rx' && userPendingCheckout;
  const yearlyVisitRequired = requireYearlyMedicalVisitUpdate(subscription, visit);

  const userActionRequired = (subscriptionActive && (userSkinProfileActionRequired || yearlyVisitRequired)) ||
    (user && user.requirePaymentDetailUpdate) ||
    (subscriptionNone && rxOrderPendingCheckout) ||
    (subscriptionNone && visitPhotosRejected);

  return userActionRequired;
}

export const displayUserNotification = (user, visit, subscription, order) => {
  const userActionRequired = isUserActionRequired(user, visit, subscription, order);
  const state = store.getState();
  const userHasUnreadMessages = hasUnreadMessages(state);

  return userActionRequired || userHasUnreadMessages;
}


// All actions related to Skin Profile, including answering questions, uploading photos (photo ID), and re-take photos
export const getUserSkinProfileAction = (user, visit) => {
  const rxExpired = isRxExpired(user);
  const visitPhotosPending = isVisitPhotosPending(visit);
  const visitPhotosRejected = isVisitPhotosRejected(visit);
  const visitPhotoIdRejected = isVisitPhotoIdRejected(visit);
  const visitPendingUserInput = isVisitPendingUserInput(visit);

  let actionText = rxExpired
    ? userActionItemText.completeYearlySkinProfileQuestionnaire
    : userActionItemText.completeSkinProfileQuestionnaire;
  let ctaText = userActionItemCTAText.completeSkinProfileQuestionnaire;
  let urlRoute = 'skin-profile';

  if (visitPhotosPending) {
    // questionnaire complete, user has not started photo upload
    actionText = rxExpired
      ? userActionItemText.uploadYearlySkinProfilePhotos
      : userActionItemText.uploadSkinProfilePhotos;
    ctaText = userActionItemCTAText.uploadPhoto;
    urlRoute = 'photos';
  }

  if (visitPendingUserInput) {
    if (visitPhotoIdRejected) {
      actionText = userActionItemText.uploadPhotoId;
      ctaText = userActionItemCTAText.uploadPhotoId;
      urlRoute = 'edit-photos';
    }
    if (visitPhotosRejected) {
      actionText = userActionItemText.retakePhotos;
      ctaText = userActionItemCTAText.retakePhoto;
      urlRoute = 'edit-photos';
    }
  }

  return {'actionText': actionText, 'ctaText': ctaText, 'urlRoute': urlRoute};

}