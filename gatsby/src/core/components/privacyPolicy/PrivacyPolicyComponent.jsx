import React, { Component } from "react"
import styled from "@emotion/styled"
import { Container } from "reactstrap"

import { scrollToTop } from "../../../common/helpers/scrollToTop"

const colors = {
  dark: "#000",
}

const fontSizes = {
  normal: "20px",
  big: "56px",
}

const Section = styled("section")`
  -webkit-font-smoothing: antialiased;
  font-weight: normal;
  line-height: 1.6;
  font-size: ${fontSizes.normal};
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 60px 0;
  color: ${colors.dark};

  a {
    color: ${colors.dark};

    &:hover {
      color: ${colors.dark};
    }
  }
`

const Header = styled("h1")`
  font-size: ${fontSizes.big};
  text-transform: uppercase;
  margin: 35px 0;
`

const Title = styled("h2")`
  font-weight: bold;
  text-decoration: underline;
  font-size: ${fontSizes.normal};
  margin: 25px 0;
  padding-top: 30px;
`

const Emphasis = styled("em")`
  text-decoration: underline;
`

export default class PrivacyPolicyComponent extends Component {
  componentDidMount() {
    scrollToTop()
  }

  render() {
    return (
      <Section>
        <Container>
          <Header>PRIVACY POLICY</Header>
          <p>
            <strong>Effective date: June 8, 2023</strong>
          </p>
          <p>
            We at Dear Brightly know you care about how your personal
            information is used and shared, and we take your privacy seriously.
            Please read the following to learn more about our Privacy Policy.{" "}
            <strong>
              By using or accessing the Services in any manner, you acknowledge
              that you accept the practices and policies outlined in this
              Privacy Policy, and you hereby consent that we will collect, use,
              and share your information in the following ways.
            </strong>
          </p>
          <p>
            Remember that your use of Dear Brightly’s Services is at all times
            subject to the Terms of Use, which incorporates this Privacy Policy.
            Any terms we use in this Policy without defining them have the
            definitions given to them in the Terms of Use.
          </p>

          <Title>What does this Privacy Policy cover?</Title>
          <p>
            This Privacy Policy covers our treatment of personally identifiable
            information ("Personal Information") that we gather when you are
            accessing or using our Services, but not to the practices of
            companies we don’t own or control, or people that we don’t manage.
            We gather various types of Personal Information from our users, as
            explained in more detail below, and we use this Personal Information
            internally in connection with our Services, including to
            personalize, provide, and improve our services, to allow you to set
            up a user account and profile, to contact you and allow other users
            to contact you, to fulfill your requests for certain products and
            services, and to analyze how you use the Services. In certain cases,
            we may also share some Personal Information with third parties, but
            only as described below.
          </p>
          <p>
            As noted in the Terms of Use, the Services are intended for users
            ages 18-65 only. Additionally, we do not knowingly collect or
            solicit personal information from anyone under the age of 13. If you
            are under 13, please do not attempt to register for the Services or
            send any personal information about yourself to us. If we learn that
            we have collected personal information from a child under age 13, we
            will delete that information as quickly as possible. If you believe
            that a child under 13 may have provided us personal information,
            please contact us at support@dearbrightly.com.
          </p>
          <p>
            Under a federal law called the Health Insurance Portability and Accountability Act (“HIPAA”),
            some of the demographic, health and/or health-related information that Dear Brightly collects as
            part of providing the Services may be considered “protected health information” or “PHI.” Specifically,
            Dear Brightly provides technological and other services to connect patients to licensed medical providers
            (“Healthcare Providers”) and to the extent Dear Brightly receives identifiable information about you from
            or on behalf of Healthcare Providers, that information may be PHI. HIPAA provides specific protections for
            the privacy and security of PHI and restricts how PHI is used and disclosed. Dear Brightly may only use and
            disclose your PHI in the ways permitted by your Healthcare Provider(s).
          </p>

          <Title>Will Dear Brightly ever change this Privacy Policy?</Title>
          <p>
            We’re constantly trying to improve our Services, so we may need to
            change this Privacy Policy from time to time as well, but we will
            alert you to changes by placing a notice on the www.dearbrightly.com
            website, by sending you an email, and/or by some other means. Please
            note that if you’ve opted not to receive legal notice emails from us
            (or you haven’t provided us with your email address), those legal
            notices will still govern your use of the Services, and you are
            still responsible for reading and understanding them. If you use the
            Services after any changes to the Privacy Policy have been posted,
            that means you agree to all of the changes.
          </p>

          <Title>What Information does Dear Brightly Collect?</Title>
          <p>
            <Emphasis>Information You Provide to Us:</Emphasis>
          </p>
          <p>
            We receive and store any information you knowingly provide to us.
            For example, when you register for an Account, purchase a Product,
            or otherwise use the Services, we may collect Personal Information
            such as your name, email address, mailing address, phone number and
            health or medical information (for example,medical records,
            doctor-patient interactions, age, gender, health background, health
            status, prescribed and over-the-counter medications, medical ID
            number, driver's license number, laboratory testing results, and
            photographs). Certain information may be required to register with
            us or to take advantage of some of our features.
          </p>
          <p>
            If permitted by law, we may communicate with you if you’ve provided us the means to do
            so. For example, if you’ve given us your email address, we may send
            you promotional email offers on behalf of other businesses, or email
            you about your use of the Services. Also, we may receive a
            confirmation when you open an email from us. This confirmation helps
            us make our communications with you more interesting and improve our
            Services. Additionally, Dear Brightly may send you email
            correspondence that may contain details of your treatment. These
            emails will never contain your photos or payment information. Dear
            Brightly will never request that you email us any protected health
            information or payment information. If you do not want to receive
            communications from us, please indicate your preference by clicking
            the unsubscribe link included at the bottom of a Dear Brightly
            email. You cannot opt out of certain emails we need to send you
            relating to normal business operations (for example, notifying you
            of a message from your medical provider). To opt out of all emails
            from Dear Brightly, you may email support@dearbrightly.com and
            cancel your Dear Brightly membership.
          </p>
          <p>
            <Emphasis>Information Collected Automatically</Emphasis>
          </p>
          <p>
            Whenever you interact with our Services, we automatically receive
            and record information on our server logs from your browser or
            device, which may include your IP address, geolocation data, device
            identification, “cookie” information, the type of browser and/or
            device you’re using to access our Services, and the page or feature
            you requested. “Cookies” are identifiers we transfer to your browser
            or device that allow us to recognize your browser or device and tell
            us how and when pages and features in our Services are visited and
            by how many people. You may be able to change the preferences on
            your browser or device to prevent or limit your device’s acceptance
            of cookies, but this may prevent you from taking advantage of some
            of our features.
          </p>
          <p>
            Our advertising partners may also transmit cookies to your browser
            or device, when you click on ads that appear on the Services. Also,
            if you click on a link to a third party website or service, a third
            party may also transmit cookies to you. Again, this Privacy Policy
            does not cover the use of cookies by any third parties, and we
            aren’t responsible for their privacy policies and practices. Please
            be aware that cookies placed by third parties may continue to track
            your activities online even after you have left our Services, and
            those third parties may not honor “Do Not Track” requests you have
            set using your browser or device.
          </p>
          <p>
            We may use this data to customize content for you that we think you
            might like, based on your usage patterns. We may also use it to
            improve the Services – for example, this data can tell us how often
            users use a particular feature of the Services, and we can use that
            knowledge to make the Services interesting to as many users as
            possible.
          </p>
          <p>
            <Emphasis>
              Information Collected From Other Websites and Do Not Track Policy
            </Emphasis>
          </p>
          <p>
            Through cookies we place on your browser or device, we may collect
            information about your online activity after you leave our Services.
            Just like any other usage information we collect, this information
            allows us to improve the Services and customize your online
            experience, and otherwise as described in this Privacy Policy. Your
            browser may offer you a “Do Not Track” option, which allows you to
            signal to operators of websites and web applications and services
            (including behavioral advertising services) that you do not wish
            such operators to track certain of your online activities over time
            and across different websites. Our Services do not support Do Not
            Track requests at this time, which means that we collect information
            about your online activity both while you are using the Services and
            after you leave our Services.
          </p>

          <Title>
            Will Dear Brightly Share Any of the Personal Information it
            Receives?
          </Title>
          <p>
            We do not rent or sell your Personal Information in personally
            identifiable form to anyone, provided certain Personal Information
            may be transferred in connection with business transfers, as
            described below. We may share your Personal Information with third
            parties as described in this section:
          </p>
          <p>
            <strong>Information that’s been de-identified</strong>. We may
            de-identify your Personal Information so that you are not identified
            as an individual, and provide that information to our partners. We
            may also provide aggregate usage information to our partners (or
            allow partners to collect that information from you), who may use
            such information to understand how often and in what ways people use
            our Services, so that they, too, can provide you with an optimal
            online experience. For example, we may use Segment and Google
            Analytics to analyze and improve our Services. For more information
            on how Segment uses data when you use the Services, please visit
            https://segment.com/docs/legal/privacy/. For more information on how
            Google uses data when you use the Services, please visit
            www.google.com/policies/privacy/partners/. Except as set forth in
            the “<strong>Information Shared with Healthcare Providers</strong>”
            section below, we never disclose aggregate usage or de-identified
            information to a partner (or allow a partner to collect such
            information) in a manner that would identify you as an individual
            person.
          </p>
          <p>
            <strong>Advertisers</strong>: We allow advertisers and/or merchant
            partners (“Advertisers”) to choose the demographic information of
            users who will see their advertisements and/or promotional offers
            and you agree that we may provide any of the information we have
            collected from you to an Advertiser, in order for that Advertiser
            to select the appropriate audience for those advertisements and/or
            offers. We may disclose information that could identify you personally;
            however, we only will disclose information as strictly necessary for
            the business purpose(s) of the disclosure. For example, we
            might use the fact you are located in San Francisco to show you ads
            or offers for San Francisco businesses. Or, we might allow
            Advertisers to display their ads to users with similar usage patterns to
            yours. Note that if an advertiser asks us to show an ad to a certain
            audience or audience segment and you respond to that ad, the advertiser
            may conclude that you fit the description of the audience they were
            trying to reach.
          </p>
          <p>
            <strong>Google Analytics</strong>: We use Google Analytics to help us understand how our
            customers use the Site. You can read more about how Google uses your Personal Information
            here: https://policies.google.com/technologies/partner-sites. You can also opt-out of Google Analytics
            here: https://tools.google.com/dlpage/gaoptout.
          </p>
          <p>
            <strong>Affiliated Businesses:</strong> In certain situations,
            businesses or third party websites we’re affiliated with may sell or
            provide products or services to you through or in connection with
            the Services (either alone or jointly with us). You can recognize
            when an affiliated business is associated with such a transaction or
            service, and we will share your Personal Information with that
            affiliated business only to the extent that it is related to such
            transaction or service. We have no control over the policies and
            practices of third party websites or businesses as to privacy or
            anything else, so if you choose to take part in any transaction or
            service relating to an affiliated website or business, please review
            all such business’ or websites’ policies.
          </p>
          <p>
            <strong>Agents:</strong>
            We employ other companies and people to perform tasks on our behalf
            and need to share your information with them to provide products or
            services to you; for example, we may use a payment processing
            company to receive and process your credit card transactions for us.
            We currently use Stripe as our Payment Processor (www.stripe.com).
            Unless we tell you differently, our agents do not have any right to
            use the Personal Information we share with them beyond what is
            necessary to assist us. Note that an “agent” may also be considered
            a “partner” in certain circumstances, and would be subject to the
            terms of the “<strong>Information that’s been de-identified</strong>
            ” section in that regard.
          </p>
          <p>
            <strong>Information Shared with Healthcare Providers</strong>: In order
            to provide you the services you request, we
            may share your Personal Information with Healthcare Providers for
            dermatological diagnosis and treatment of skin. For example, when
            you submit photographs or medical history information using the
            Services, we will share that Personal Information with your
            Healthcare Providers in order to provide the Services and
            appropriate Products to you. We may also share your Personal
            Information with your Healthcare Providers to enable them to refer
            you to other Healthcare Providers on your behalf or to perform
            analyses on potential health issues or treatments, provided that you
            choose to use the applicable Services.
          </p>
          <p>
            <strong>User Submissions:</strong> Certain user information,
            including testimonials, feedback, and suggestions, along with your
            name and User ID, that you have provided to us in connection with
            the Services, may be displayed to other users to facilitate user
            interaction within the Services. Please remember that any
            testimonials, feedback or suggestions that you voluntarily disclose
            to us for the purpose of posting online becomes publicly available,
            and can be collected and used by anyone.
          </p>
          <p>
            <strong>Business Transfers:</strong> We may choose to buy or sell
            assets, and may share and/or transfer customer information in
            connection with the evaluation of and entry into such
            transactions.Also, if we (or our assets) are acquired, or if we go
            out of business, enter bankruptcy, or go through some other change
            of control, Personal Information could be one of the assets
            transferred to or acquired by a third party.
          </p>
          <p>
            <strong>Protection of Company and Others:</strong> We reserve the
            right to access, read, preserve, and disclose any information that
            we believe is necessary to comply with law or court order; enforce
            or apply our Terms of Use and other agreements; or protect the
            rights, property, or safety of Company, our employees, our users, or
            others.
          </p>

          <Title>Is Personal Information about me secure?</Title>
          <p>
            Your account is protected by a password for your privacy and
            security. If you access your account via a third party site or
            service, you may have additional or different sign-on protections
            via that third party site or service. You must prevent unauthorized
            access to your account and Personal Information by selecting and
            protecting your password and/or other sign-on mechanism
            appropriately and limiting access to your computer or device and
            browser by signing off after you have finished accessing your
            account.
          </p>
          <p>
            We endeavor to protect the privacy of your account and other
            Personal Information we hold in our records, but unfortunately, we
            cannot guarantee complete security. Unauthorized entry or use,
            hardware or software failure, and other factors, may compromise the
            security of user information at any time.
          </p>

          <Title>What Personal Information can I access?</Title>
          <p>
            Through your Account settings, you may access, and, in some cases,
            edit or delete the following information you’ve provided to us:
          </p>
          <ul>
            <li>name and password</li>
            <li>email address</li>
            <li>location</li>
            <li>
              user profile information, including images and videos you have
              uploaded to the site.
            </li>
          </ul>
          <p>
            The information you can view, update, and delete may change as the
            Services change. If you have any questions about viewing or updating
            information we have on file about you, please contact us at
            support@dearbrightly.com.
          </p>
          <p>
            Under California Civil Code Sections 1798.83-1798.84, California
            residents are entitled to contact us to prevent disclosure of
            Personal Information to third parties for such third parties’ direct
            marketing purposes; in order to submit such a request, please
            contact us at support@dearbrightly.com. California residents are
            entitled to ask us for a notice identifying the categories of
            Personal Information which we share with our affiliates and/or third
            parties for marketing purposes, and providing contact information
            for such affiliates and/or third parties. If you are a California
            resident and would like a copy of this notice, please submit a
            written request to: support@dearbrightly.com.
          </p>

          <Title>What choices do I have?</Title>
          <p>
            You can always opt not to disclose information to us, but keep in
            mind some information may be needed to register with us or to take
            advantage of some of our features.
          </p>
          <p>
            You may be able to add, update, or delete information as explained
            above. When you update information, however, we may maintain a copy
            of the unrevised information in our records. You may request
            deletion of your account by emailing support@dearbrightly.com, but
            some information may remain in our records after your deletion of
            such information from your account. We may use any aggregated data
            derived from or incorporating your Personal Information after you
            update or delete it, but not in a manner that would identify you
            personally.
          </p>

          <Title>What if I have questions about this policy?</Title>
          <p>
            If you have any questions or concerns regarding our privacy
            policies, please send us a detailed message to
            support@dearbrightly.com, and we will try to resolve your concerns.
          </p>
        </Container>
      </Section>
    )
  }
}
