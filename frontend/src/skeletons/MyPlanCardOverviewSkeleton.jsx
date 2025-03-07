import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {Row, Col} from 'reactstrap';

export function MyPlanCardOverviewSkeleton() {
  return(
    <Row>
      <Col md={4}>
        <Skeleton width={250} height={235}/>
      </Col>
      <Col md={8}>
        <Row className="mb-3">
          <Col md={12} height={1000}>
            <Skeleton height={50}/>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
          <Col md={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
          <Col md={12} className="mb-1">
            <Skeleton height={20}/>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Skeleton height={80}/>
          </Col>
          <Col md={4}>
            <Skeleton height={80}/>
          </Col>
          <Col md={4}>
            <Skeleton height={80}/>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
