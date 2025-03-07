import React from "react"
import { history } from 'src/history';

import TermsOfUseComponent from "../core/components/terms/TermOfUseComponent";

const TermsOfUseContainer = () => 
    <TermsOfUseComponent redirectToUrl={history.push}></TermsOfUseComponent>
  
export default TermsOfUseContainer
