import React from 'react';
import styled from 'react-emotion';
import RcPagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import { DoubleRightOutlined, DoubleLeftOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';


const PaginationWrapper = styled('div')`
    margin: 30px 0;
    display: flex;
    justify-content: center;
    vertical-align: middle;
`;

export class Pagination extends React.Component {
    handleChange = (page, pageSize) => {
      const paginationParams = {
        page,
        size: pageSize,
      };

      this.props.handleOnChange(true, paginationParams);
    };

    render() {
        const { current, total, size } = this.props.pagination;
        return (
            <PaginationWrapper>
                <RcPagination
                    current={current}
                    pageSize={size}
                    total={total}
                    onChange={this.handleChange}
                    prevIcon={<LeftOutlined/>}
                    nextIcon={<RightOutlined/>}
                    jumpPrevIcon={<DoubleLeftOutlined/>}
                    jumpNextIcon={<DoubleRightOutlined/>}
                />
            </PaginationWrapper>
        );
    }
}
