import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {Row, Col} from 'reactstrap';

export function MyPlanSettingsSkeleton() {
  return(
    <Row className="w-100 m-0">

      <Row className="w-100 m-0">
        <Col lg={12} className="mb-3">
          <Skeleton height={50}/>
        </Col>
      </Row>

      <Row className="w-100 m-0">
        <Col lg={4}>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton circle={true} width={70} height={70}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={30}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={40}/>
          </Col>
        </Col>

        <Col lg={4}>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton circle={true} width={70} height={70}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={30}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={40}/>
          </Col>
        </Col>

        <Col lg={4}>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton circle={true} width={70} height={70}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={30}/>
          </Col>
          <Col lg={12} className="mb-2 text-center">
            <Skeleton height={40}/>
          </Col>
        </Col>
      </Row>
    </Row>
  )
}
