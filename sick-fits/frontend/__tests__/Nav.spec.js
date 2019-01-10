import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import { fakeUser, fakeCartItem } from "../lib/testUtils";
import Nav from "../components/Nav";
import { CURRENT_USER_QUERY } from "../components/User";
import toJson from "enzyme-to-json";

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

const signedInMockWithCartItems = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
        }
      }
    }
  }
];

describe("<Nav />", () => {
  it("renders the nav when the user is not logged in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMock}>
        <Nav />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length).toBe(2);
    expect(nav.text()).toContain("Sign In");
    // expect(toJson(nav)).toMatchSnapshot();
  });
  it("renders the nav when the user is logged in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMock}>
        <Nav />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length).toBe(6);
    expect(nav.text()).toContain("Sign Out");
    // expect(toJson(nav)).toMatchSnapshot();
  });
  it("renders the amount of items in the cart", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMockWithCartItems}>
        <Nav />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const nav = wrapper.find("[data-test='nav']");
    const count = nav.find("div.count");
    expect(toJson(count)).toMatchSnapshot();
  });
});
