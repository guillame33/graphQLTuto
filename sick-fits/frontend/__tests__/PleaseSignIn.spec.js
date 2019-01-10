import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import { fakeUser } from "../lib/testUtils";
import PleaseSignIn from "../components/PleaseSignIn";
import { CURRENT_USER_QUERY } from "../components/User";

const notSignedInMock = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: null }
    }
  }
];

const signedInMock = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: fakeUser() }
    }
  }
];

describe("<PleaseSignIn />", () => {
  it("renders the sign in dialog to logged users", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMock}>
        <PleaseSignIn />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Please sign in before continuing");
    expect(wrapper.find("Signin").exists()).toBe(true);
  });
  it("renders the child component when the user is signed in", async () => {
    const Hey = () => <p>Hey!</p>;
    const wrapper = mount(
      <MockedProvider mocks={signedInMock}>
        <PleaseSignIn>
          <Hey />
        </PleaseSignIn>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.contains(<Hey />)).toBe(true);
  });
});
