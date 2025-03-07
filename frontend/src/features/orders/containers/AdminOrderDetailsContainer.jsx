import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Input } from 'reactstrap';
import Select from 'react-select';
import uuid from 'uuid/v1';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import omit from 'lodash/omit'

import { redirectToUrl } from 'src/common/actions/navigationActions';
import {
  fetchOrderRequest,
  updateOrderRequest,
} from 'src/features/orders/actions/ordersActions';
import { WithLoader } from 'src/common/components/WithLoader';
import {
  getAllProducts,
  getProductsOptions,
} from 'src/features/products/selectors/productsSelectors';

import { AdminOrderProductsDetail } from '../components/AdminOrderProductsDetail';
import * as S from '../components/styles';

import {
  isFetchingOrders,
  getOrdersErrorMessage,
  isDataFetchedSuccessfully,
  getOrderStatusesOptions,
  getOrder,
} from '../selectors/ordersSelectors';
import { OrderDetailsSummary } from '../components/OrderDetailsSummary';
import { AdminOrderDetailsShippingInfo } from '../components/AdminOrderDetailsShippingInfo';

class AdminOrderDetailsLoader extends React.Component {
  state = {
    order: undefined,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchOrderRequest(true, id);
  }

  componentWillReceiveProps(nextProps) {
    const { order } = this.props;
    if (nextProps && nextProps.order !== order) {
      this.setState({
        order: nextProps.order,
      });
    }
  }

  render() {
    const { order } = this.state;
    return (
      <WithLoader
        hasData={!(order === undefined)}
        isFetching={this.props.isFetching}
        fetchingMessage="Fetching order data..."
        fetchedSuccessfully={this.props.fetchedSuccessfully}
        noDataErrorMessage="No order found with given ID"
        errorMessage={this.props.errorMessage}
      >
        <AdminOrderDetailsWithFormik {...this.props} />
      </WithLoader>
    );
  }
}

class AdminOrderDetails extends React.Component {
  state = {
    status: this.props.order && this.props.order.status,
    notes: this.props.order && this.props.order.notes,
    selectedStatus: this.props.order && this.props.orderStatusesOptions.filter(
      option => option.value === this.props.order.status
    ).map(
      option => ({value: option.value, label: option.name})
    ),
    orderProducts:
      this.props.order && this.props.order.orderProducts &&
      this.props.order.orderProducts.map(orderProduct => ({
        ...orderProduct,
        nr: uuid(),
      })),
  };

  createOptions = (items) => {
    return items.map(option => ({value: option.value, label: option.name}))
  };

  handleBackClick = () => this.props.redirectToUrl('/admin-dashboard/orders');

  handleChange = (field, value) => this.setState({ [field]: value });

  handleNotesChange = ({ target }) => this.handleChange('notes', target.value);

  handleStatusChange = selectedStatus => {
    if(selectedStatus){
      this.setState({
        ...this.state,
        selectedStatus,
      });
      this.handleChange('status', selectedStatus.value);
    }
  };

  handleQuantityChange = (quantity, nr) =>
    this.setState(state => ({
      orderProducts: state.orderProducts.map(
        orderProduct =>
          orderProduct.nr == nr
            ? {
              ...orderProduct,
              quantity,
            }
            : orderProduct,
      ),
    }));

  handleItemChange = (newItemProductId, nr) => {
    const { id, name, price } = this.props.products.find(product => product.id == newItemProductId);
    const productUuid = id;
    const productName = name;

    this.setState(state => ({
      orderProducts: state.orderProducts.map(
        orderProduct =>
          orderProduct.nr == nr
            ? {
              ...orderProduct,
              productUuid,
              productName,
              price,
            }
            : orderProduct,
      ),
    }));
  };

  handleItemRemove = nr =>
    this.setState(state => ({
      orderProducts: state.orderProducts.filter(orderProduct => orderProduct.nr != nr),
    }));

  handleItemAdd = () => {
    const { id, name, price } = this.props.products[0];
    const productUuid = id;
    const productName = name;

    this.setState(state => ({
      orderProducts: [
        ...state.orderProducts,
        { productUuid, productName, price, quantity: 1, frequency: 1, nr: uuid() },
      ],
    }));
  };

  handleSubmit = async (e) => {
    await this.props.setValues({
      ...this.props.values,
      ...this.state,
    });

    this.props.handleSubmit();
  };

  render() {
    const { order, orderStatusesOptions } = this.props;
    const { notes } = this.state;
    const orderTitle = `Order Details`;
    const orderType = order.isRefill ? `${order.orderType} (refill)` : `${order.orderType}`;
    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        background: '#fff',
        minHeight: '45px',
        height: '45px',
        boxShadow: state.isFocused ? null : null,
      }),

      container: (provided, state) => ({
        ...provided,
        paddingBottom: '6px',
      }),

      valueContainer: (provided, state) => ({
        ...provided,
        height: '45px',
        padding: '0 6px',
      }),

      input: (provided, state) => ({
        ...provided,
        margin: '0px',
      }),
      indicatorSeparator: state => ({
        display: 'none',
      }),
      indicatorsContainer: (provided, state) => ({
        ...provided,
        height: '45px',
      }),
    };

    return (
      <S.Container>
        <S.Header marginBottom="40px">{orderTitle}</S.Header>
        <form onSubmit={(e) => e.preventDefault()}>
        <S.Wrapper>
          <S.Status>
            <Row>
              <Col lg="6">
                <S.ItemTitle>Number:</S.ItemTitle>
              </Col>
              <Col lg="6">
                <p>{order.orderNumber}</p>
              </Col>
            </Row>
            <Row>
              <Col lg="6">
                <S.ItemTitle>Customer:</S.ItemTitle>
              </Col>
              <Col lg="6">
                <p>{order.customer.email}</p>
              </Col>
            </Row>
            <Row>
              <Col lg="6">
                <S.ItemTitle>Type:</S.ItemTitle>
              </Col>
              <Col lg="6">
                <p>{orderType}</p>
              </Col>
            </Row>
            <Row>
              <Col lg="6">
                <S.ItemTitle>Status:</S.ItemTitle>
              </Col>
              <Col lg="6">
                <Select
                  styles={customStyles}
                  placeholder="Select Status"
                  value={this.state.selectedStatus}
                  options={this.createOptions(orderStatusesOptions)}
                  onChange={this.handleStatusChange}
                />
              </Col>
            </Row>

            <Row>
              <Col lg="6">
                <S.ItemTitle>Notes:</S.ItemTitle>
              </Col>
              <Col lg="6">
                <Input
                  type="textarea"
                  value={notes}
                  onChange={this.handleNotesChange}
                  rows={4}
                />
              </Col>
            </Row>
          </S.Status>
        </S.Wrapper>
        <S.Wrapper>
          <Row>
            <AdminOrderDetailsShippingInfo
              onChange={this.props.handleChange}
              onBlur={this.props.handleBlur}
              errors={this.props.errors}
              touched={this.props.touched}
              data={this.props.values}
            />
          </Row>
        </S.Wrapper>
        <S.Wrapper>
          <Row>
            <AdminOrderProductsDetail
              productsOptions={this.props.productsOptions}
              orderProducts={this.state.orderProducts}
              onQuantityChange={this.handleQuantityChange}
              onItemChange={this.handleItemChange}
              onItemRemove={this.handleItemRemove}
              onItemAdd={this.handleItemAdd}
            />
            <OrderDetailsSummary
              order={order}
              subtotal={order.subtotal}
              totalAmount={order.totalAmount}
              tax={order.tax}
              shippingFee={order.shippingFee}
              discountCode={order.discountCode}
              discount={order.discount}
            />
          </Row>
        </S.Wrapper>
        </form>
        <S.ButtonContainer>
          <S.Button onClick={this.handleBackClick}>Cancel</S.Button>
          <S.Button onClick={this.handleSubmit} type="submit">Save</S.Button>
        </S.ButtonContainer>
        <br />
      </S.Container>
    );
  }
}

const AdminOrderDetailsWithFormik = withFormik({
  mapPropsToValues: props => ({
    ...props.order.shippingDetails,
  }),
  validationSchema: Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required('First name is required')
      .nullable(),
    lastName: Yup.string()
      .trim()
      .required('Last name is required')
      .nullable(),
    phone: Yup.string()
      .required('Phone number is required')
      .min(10, 'Phone number must contain at lest 10 digits')
      .matches(/^[0-9]*$/, { message: 'Phone number must contain 10 digits' })
      .nullable(),
    addressLine1: Yup.string()
      .trim()
      .required('Address is required')
      .nullable(),
    city: Yup.string()
      .trim()
      .required('City is required')
      .nullable(),
    state: Yup.string()
      .trim()
      .required('State is required')
      .nullable(),
    postalCode: Yup.string()
      .required('Postal code is required')
      .min(5, 'Postal code must contain 5 digits')
      .max(5, 'Postal code must contain 5 digits')
      .matches(/^[0-9]*$/, { message: 'Postal code must contain 5 digits' })
      .nullable(),
  }),
  handleSubmit: (values, { props }) => {
    const orderDetails = {
      status: values.status,
      orderProducts: values.orderProducts,
      notes: values.notes,
      shippingDetails: omit(values, ['status', 'orderProducts', 'email', 'notes']),
    };

    props.updateOrderRequest({
      id: props.order.id,
      orderDetails,
    });
  },
})(AdminOrderDetails);

const mapStateToProps = state => ({
  order: getOrder(state),
  products: getAllProducts(state),
  productsOptions: getProductsOptions(state),
  orderStatusesOptions: getOrderStatusesOptions(state),
  errorMessage: getOrdersErrorMessage(state),
  isFetching: isFetchingOrders(state),
  fetchedSuccessfully: isDataFetchedSuccessfully(state),
});

export const AdminOrderDetailsContainer = connect(
  mapStateToProps,
  { fetchOrderRequest, redirectToUrl, updateOrderRequest },
)(AdminOrderDetailsLoader);
