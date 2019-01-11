import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import SignUp, { SIGNUP_MUTATION } from "../components/Signup";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser } from "../lib/testUtils";
import { ApolloConsumer } from "react-apollo";

const me = fakeUser();
const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: me.email,
        name: me.name,
        password: "12345"
      }
    },
    result: {
      data: {
        signup: {
          __typename: "User",
          id: "abc123",
          email: me.email,
          name: me.name
        }
      }
    }
  },
  // current user query mock
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me } }
  }
];

describe("<SignUp />", () => {
  it("renders ans matches snapshot.", () => {
    const wrapper = mount(
      <MockedProvider>
        <SignUp />
      </MockedProvider>
    );
    // const form = wrapper.find("form[data-test='form']");
    expect(toJSON(wrapper.find("form"))).toMatchSnapshot();
  });
  it("it calls the mutation properly", () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <SignUp />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
  });
});
