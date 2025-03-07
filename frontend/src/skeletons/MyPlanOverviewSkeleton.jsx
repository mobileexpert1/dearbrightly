import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {Row, Col} from 'reactstrap';

export function MyPlanOverviewSkeleton() {
  return(
    <Row className="w-100 m-0">
      <Col lg={4}>
        <Skeleton height={235}/>
      </Col>
      <Col lg={8}>
        <Row className="mb-3">
          <Col lg={12} height={1000}>
            <Skeleton height={50}/>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
          <Col lg={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
          <Col lg={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={4}>
            <Skeleton height={80}/>
          </Col>
          <Col lg={4}>
            <Skeleton height={80}/>
          </Col>
          <Col lg={4}>
            <Skeleton height={80}/>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
