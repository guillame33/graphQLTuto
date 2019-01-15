import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import SignUp, { SIGNUP_MUTATION } from "../components/Signup";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser } from "../lib/testUtils";
import { ApolloConsumer } from "react-apollo";

const type = (wrapper, name, value) => {
  wrapper
    .find(`input[name="${name}"]`)
    .simulate("change", { target: { name, value } });
};
const me = fakeUser();
const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        name: me.name,
        email: me.email,
        password: "12345"
      }
    },
    result: {
      data: {
        signup: {
          name: me.name,
          email: me.email,
          id: "abc123",
          __typename: "User"
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
  it("it calls the mutation properly", async () => {
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
    wrapper.update();
    type(wrapper, "name", me.name);
    type(wrapper, "email", me.email);
    type(wrapper, "password", "wes");
    wrapper.update();
    wrapper.find("form").simulate("submit");
    await wait();
    // query the user of the appolo client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
    console.log(user);
    expect(user.data.me).toMatchObject(me);
  });
});
