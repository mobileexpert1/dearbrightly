import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import DBSpinner from 'src/common/components/BbSpinner';

import { CustomRoute } from 'src/common/components/CustomRoute';
import NotFoundComponent from 'src/components/NotFoundComponent';
import { withEMRNavContainer } from 'src/features/emr/containers/EMRNavContainer';

const AdminDashboard = lazy(() =>
  import('src/features/dashboard/containers/AdminDashboardContainer'),
);
const CheckoutPage = lazy(() => import('src/features/checkout/containers/CheckoutContainer'));
const EmrContainer = lazy(() => import('src/features/emr/containers/EMRContainer'));
const ForgotPasswordContainer = lazy(() =>
  import('src/features/auth/containers/ForgotPasswordContainer'),
);
const LoginPageContainer = lazy(() => import('src/features/auth/components/LoginPage'));
const OrderConfirmationContainer = lazy(() =>
  import('src/features/checkout/containers/OrderConfimationContainer'),
);
const PatientDetailContainer = lazy(() =>
  import('src/features/emr/containers/PatientDetailContainer'),
);
const ProductDetailCard = lazy(() =>
  import('src/features/products/containers/ProductCardContainer'),
);
const ProductsPageContainer = lazy(() =>
  import('src/features/products/containers/ProductsPageContainer'),
);
const ResetPasswordContainer = lazy(() =>
  import('src/features/auth/containers/ResetPasswordContainer'),
);
const RegistrationForm = lazy(() =>
  import('src/features/auth/containers/RegistrationFormContainer'),
);
const UnsubscribeContainer = lazy(() =>
  import('src/features/customers/containers/UnsubscribeContainer'),
);
const UploadPhotosCheckoutContainer = lazy(() =>
  import('src/features/checkout/containers/UploadPhotosCheckoutContainer'),
);
const UserDashboardContainer = lazy(() =>
  import('src/features/dashboard/containers/UserDashboardContainer'),
);
const SharingProgramContainer = lazy(() =>
  import('src/features/sharingProgram/containers/SharingProgramContainer'),
);
const InviteContainer = lazy(() =>
  import('src/features/sharingProgram/containers/InviteContainer'),
);
const WelcomeBack = lazy(() => import('src/features/yearlyVisit/components/WelcomeBack'));
const UpdateYourSkinProfile = lazy(() =>
  import('src/features/yearlyVisit/components/UpdateYourSkinProfile'),
);

const PregnancyInfo = lazy(() => import('src/features/checkout/containers/PregnancyInfo.jsx'));

const Telehealth = lazy(() => import('src/core/components/consent/Telehealth'));

const IntroQnr = lazy(() => import('src/core/components/introQuiz/Quiz'));

export const Routes = ({ isAuthenticated, isProcessing, userState }) => (
  <Suspense fallback={<div style={{
    background: 'white',
    position: 'absolute',
    zIndex: 9,
    width: '100%',
    minHeight: '1096px',
    marginTop: 15
  }}>
    <DBSpinner />
  </div>}>
    <Switch>
      <CustomRoute
        exact
        key="/"
        path="/"
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
        userState={userState}
      />
      <CustomRoute
        exact
        key="/privacy-policy"
        path="/privacy-policy"
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/terms"
        path="/terms"
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/products"
        path="/products"
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/checkout"
        path="/checkout"
        component={CheckoutPage}
        secured={false}
        checkQueryParameter={true}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/checkout-upload-photos"
        path="/checkout-upload-photos"
        component={UploadPhotosCheckoutContainer}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/order-confirmation"
        path="/order-confirmation"
        component={OrderConfirmationContainer}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/product-details/:name/"
        path="/product-details/:name/"
        component={ProductDetailCard}
        secured={false}
        checkQueryParameter={true}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        key="/user-dashboard/:section?"
        path="/user-dashboard/:section?"
        component={UserDashboardContainer}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        key="/admin-dashboard/:section?"
        path="/admin-dashboard/:section?"
        component={AdminDashboard}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/reset-password/:token"
        path="/reset-password/:token"
        component={ResetPasswordContainer}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/forgot-password/"
        path="/forgot-password/"
        component={ForgotPasswordContainer}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/user-unsubscribe/:email/:token"
        path="/user-unsubscribe/:email/:token"
        component={UnsubscribeContainer}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/register/"
        path="/register/"
        component={RegistrationForm}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/login/"
        path="/login/"
        component={LoginPageContainer}
        redirect="/user-dashboard/"
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/emr/visits"
        path="/emr/visits"
        component={withEMRNavContainer(EmrContainer)}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/emr/patients/:patientId/visits/:visitId"
        path="/emr/patients/:patientId/visits/:visitId"
        component={withEMRNavContainer(PatientDetailContainer)}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/emr/patients/:patientId"
        path="/emr/patients/:patientId"
        component={withEMRNavContainer(PatientDetailContainer)}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/sharing-program/"
        path="/sharing-program/"
        component={SharingProgramContainer}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/invite/:code"
        path="/invite/:code"
        component={InviteContainer}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/welcome-back"
        path="/welcome-back"
        component={WelcomeBack}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/update-skin-profile"
        path="/update-skin-profile"
        component={UpdateYourSkinProfile}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/pregnancy-info"
        path="/pregnancy-info"
        component={PregnancyInfo}
        secured={true}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/consent-to-telehealth"
        path="/consent-to-telehealth"
        component={Telehealth}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <CustomRoute
        exact
        key="/intro-qnr"
        path="/intro-qnr"
        component={IntroQnr}
        secured={false}
        checkQueryParameter={false}
        isAuthenticated={isAuthenticated}
        isProcessing={isProcessing}
      />
      <Route component={NotFoundComponent} />
    </Switch>
  </Suspense>
);
