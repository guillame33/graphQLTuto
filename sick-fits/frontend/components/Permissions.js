import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";

import Error from "./ErrorMessage";
import Table from "./styles/Table";
import Button from "./styles/SickButton";

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $permissions: [Permission]
    $userId: ID!
  ) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`;

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      email
      name
      permissions
    }
  }
`;

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };
  state = {
    permissions: this.props.user.permissions
  };
  handlePermissionChange = e => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      );
    }
    this.setState({
      permissions: updatedPermissions
    });
  };
  render() {
    const user = this.props.user;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{ permissions: this.state.permissions, userId: user.id }}
      >
        {(updatedPermissions, { loading, error }) => {
          return (
            <>
              {error && (
                <tr>
                  <td colSpan="8">
                    <Error error={error} />
                  </td>
                </tr>
              )}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {possiblePermissions.map(permission => (
                  <td key={permission}>
                    <label htmlFor={`${user.id}-permission-${permission}`}>
                      <input
                        id={`${user.id}-permission-${permission}`}
                        type="checkbox"
                        checked={this.state.permissions.includes(permission)}
                        value={permission}
                        onChange={this.handlePermissionChange}
                      />
                    </label>
                  </td>
                ))}
                <td>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={updatedPermissions}
                  >
                    Updat{loading ? "ing" : "e"}
                  </Button>
                </td>
              </tr>
            </>
          );
        }}
      </Mutation>
    );
  }
}

const Permissions = props => {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, loading, error }) => {
        return (
          <div>
            <Error error={error} />
            <div>
              <h2>Manage permissions</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {possiblePermissions.map(permission => (
                      <th key={permission}>{permission}</th>
                    ))}
                    <th>&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(user => (
                    <UserPermissions key={user.id} user={user} />
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        );
      }}
    </Query>
  );
};

export default Permissions;
