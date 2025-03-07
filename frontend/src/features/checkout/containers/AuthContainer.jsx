import React from 'react';
import { CreateAccount } from '../components/CreateAccount';
import { CheckoutLogin } from '../components/CheckoutLogin';
import ForgotPasswordContainer from 'src/features/auth/containers/ForgotPasswordContainer';

export default class AuthContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showView: 'sign up',
        };
    }

    handleShowView = (value, e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({
            showView: value,
        });
    };

    render() {
        return (
            <React.Fragment>
                {this.state.showView === 'sign up' && (
                    <CreateAccount
                        navigateBack={this.props.navigateBack}
                        showLogin={this.state.showLogin}
                        handleShowView={this.handleShowView}
                        handleFBLogin={this.props.handleFBLogin}
                    />
                )}
                {this.state.showView === 'sign_in' && (
                    <CheckoutLogin
                        showLogin={this.state.showLogin}
                        handleShowView={this.handleShowView}
                        handleFBLogin={this.props.handleFBLogin}
                        navigateBack={this.props.navigateBack}
                    />
                )}
                {this.state.showView === 'forgot' && (
                    <ForgotPasswordContainer
                        navigateBack={this.props.navigateBack}
                        navigateCheckout={this.props.navigateCheckout}
                    />
                )}
            </React.Fragment>
        );
    }
}
