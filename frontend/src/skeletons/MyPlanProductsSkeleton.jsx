import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {Row, Col} from 'reactstrap';

export function MyPlanProductsSkeleton() {
  return(
    <Row className="w-100 m-0">
      <Row className="w-100 m-0">
        <Col lg={12} className="mb-3">
          <Skeleton height={50}/>
        </Col>
      </Row>

      <Row className="w-100 m-0">
        <Col lg={4}>
          <Col lg={12} className="mb-3">
            <Skeleton height={200}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={65}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>
        </Col>

        <Col lg={4}>
          <Col lg={12} className="mb-3">
            <Skeleton height={200}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={65}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>
        </Col>

        <Col lg={4}>
          <Col lg={12} className="mb-3">
            <Skeleton height={200}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={65}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>

          <Col lg={12} className="mb-3">
            <Skeleton height={50}/>
          </Col>
        </Col>
      </Row>
    </Row>
  )
}
