import React from 'react';
import { Row } from 'reactstrap';
import styled from 'react-emotion';
import { MyPlanOverviewSkeleton } from "src/skeletons/MyPlanOverviewSkeleton";
import { MyPlanSettingsSkeleton } from "src/skeletons/MyPlanSettingsSkeleton";
import { MyPlanProductsSkeleton } from "src/skeletons/MyPlanProductsSkeleton";

const MyPlanSkeletonContainer = styled.div`
    padding-left: 47px;
    padding-top: 30px
`;

export function MyPlanSkeleton() {
  return(
    <MyPlanSkeletonContainer className="row w-100 bg-white">
      <Row className="w-100 mb-3">
        <MyPlanOverviewSkeleton/>
      </Row>

      <Row className="w-100 mb-3">
        <MyPlanSettingsSkeleton/>
      </Row>

      <Row className="w-100 mb-3 ">
        <MyPlanProductsSkeleton/>
      </Row>
    </MyPlanSkeletonContainer>
  )
}
