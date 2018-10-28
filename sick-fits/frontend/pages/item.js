import React from "react";

import SingleItem from "../components/SingleItem";
import { checkPropTypes } from "prop-types";

const Item = props => (
  <div>
    <SingleItem id={props.query.id} />
  </div>
);

export default Item;
