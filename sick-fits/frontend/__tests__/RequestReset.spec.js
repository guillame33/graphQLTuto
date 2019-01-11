import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import RequestReset, {
  REQUEST_REST_MUTATION
} from "../components/RequestReset";

const mocks = [
  {
    request: {
      query: REQUEST_REST_MUTATION,
      variables: { email: "toto@toto.com" }
    },
    result: {
      data: {
        requestReset: { message: "success", __typename: "Message" }
      }
    }
  }
];

describe("<RequestReset />", () => {
  it("renders ans matches snapshot.", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find("form[data-test='form']");
    expect(toJSON(form)).toMatchSnapshot();
  });
  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    // simulate typing an email
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "toto@toto.com" }
    });
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toContain(
      "Check your email for a password link!"
    );
    // expect(toJSON(form)).toMatchSnapshot();
  });
});
