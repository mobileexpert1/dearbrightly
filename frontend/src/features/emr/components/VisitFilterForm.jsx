import React from 'react'

import { Form, FormGroup, Label, Input } from 'reactstrap'
import Select from 'react-select';
import { graphql, createFragmentContainer } from 'react-relay'


// const customSelectStyles = {
//     container: (base) => ({
//         ...base,
//         height: "1em"
//     }),
//     control: (base) => ({
//         ...base,
//         height: "1em"
//     }),
//     input: (base) => ({
//         ...base,
//         height: "1em"
//     })
// }

class VisitFilterForm extends React.Component {

    _onFilterChange = (key, selected) => {
        let value = selected ? selected.map(obj => obj.value).join(',') : ''
        this.props.onFilterChange(key, value)
    }

    render() {
        let statusOptions = []
        if (this.props.rootQuery) {
            statusOptions = this.props.rootQuery.allVisitStatusChoices.edges.map(edge => {
                return {
                    label: edge.node.value,
                    value: edge.node.value
                }
            })
        }

        let serviceOptions = []
        if (this.props.rootQuery) {
            serviceOptions = this.props.rootQuery.allServiceChoices.edges.map(edge => {
                return {
                    label: edge.node.value,
                    value: edge.node.value
                }
            })
        }

        return (
            <Form onSubmit={(event) => event.preventDefault()}>
                <FormGroup style={{ width: "100%" }}>
                    <Label for="status">Status</Label>
                    <Select
                        isMulti
                        defaultValue={this.props.selectedStatus}
                        name="status"
                        options={statusOptions}
                        onChange={(selected) => this._onFilterChange('status', selected)}
                    />
                </FormGroup>
                <FormGroup style={{ width: "100%" }}>
                    <Label for="service">Service</Label>
                    <Select
                        isMulti
                        defaultValue={this.props.selectedService}
                        name="service"
                        options={serviceOptions}
                        onChange={(selected) => this._onFilterChange('service', selected)}
                    />
                </FormGroup>
                <FormGroup style={{ width: "100%" }}>
                    <Label for="state">State</Label>
                    <Select
                        isMulti
                        defaultValue={this.props.selectedState}
                        name="state"
                        options={this.props.states}
                        getOptionLabel={option => option['name']}
                        onChange={(selected) => this._onFilterChange('state', selected)}
                    />
                </FormGroup>
            </Form>
        )
    }
}

export default createFragmentContainer(
    VisitFilterForm,
    {
        rootQuery: graphql`
            fragment VisitFilterForm_rootQuery on Query {            
                allVisitStatusChoices{
                    edges{
                      node{
                        value
                      }
                    }
                  }
                  allServiceChoices{
                    edges{
                      node{
                        value
                      }
                    }
                  }
            }
        `,
    }
)