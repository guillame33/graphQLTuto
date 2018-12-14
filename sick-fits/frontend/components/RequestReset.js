import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const REQUEST_REST_MUTATION = gql`
  mutation REQUEST_REST_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

class Signin extends Component {
  state = { email: "" };
  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation mutation={REQUEST_REST_MUTATION} variables={this.state}>
        {(reset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await reset();
              this.setState({ email: "" });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Ask to reset your password</h2>
              <Error error={error} />
              {!error && !loading && called && (
                <p>Check your email for a password link!</p>
              )}
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Request Reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signin;
