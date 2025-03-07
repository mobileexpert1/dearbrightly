import React from 'react';

import * as S from './styles';

export const Benefits = ({ benefits }) => (
    <React.Fragment>
        <S.Heading1 bold style={{fontSize:"20px"}}>Benefits</S.Heading1>
        {benefits.length > 1 &&
            benefits.map((item, index) => <S.SectionText key={index} style={{fontSize: "14px", lineHeight:"27px", maxWidth:"510px"}}>{item}</S.SectionText>)}
        {benefits.length == 1 && <S.SectionText style={{fontSize: "14px", lineHeight:"27px", maxWidth:"510px"}}>{benefits}</S.SectionText>}
    </React.Fragment>
);
