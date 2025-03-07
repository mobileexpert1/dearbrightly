import React from 'react';

import * as S from 'src/features/products/components/styles';

export const OtcProductDescription = ({ product }) => {
    const productName = product.name.replace(/refill/ig,'');
    return (
        <React.Fragment>
            <S.Heading1 bold style={{fontSize:"20px", maxWidth:"320px"}}>
                Why {productName} is a part of the Derma Five?
            </S.Heading1>
            {product.foreverFiveReasons.length > 1 &&
            product.foreverFiveReasons.map((item, index) => <S.SectionText key={index} style={{fontSize: "14px", lineHeight:"27px", maxWidth:"510px"}}>{item}</S.SectionText>)
            }
            {product.foreverFiveReasons.length == 1 && <S.SectionText style={{fontSize: "14px", lineHeight:"27px", maxWidth:"510px"}}>{product.foreverFiveReasons}</S.SectionText>}
        </React.Fragment>
    );
}

