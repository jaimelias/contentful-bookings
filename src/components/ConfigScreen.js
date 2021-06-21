import React, { Component } from 'react';
import { Heading, Form, Workbench, Paragraph } from '@contentful/forma-36-react-components';
import { css } from 'emotion';


export default class Config extends Component {
  constructor(props) {
    super(props);
    this.state = { parameters: {} };
    props.sdk.app.onConfigure(() => this.onConfigure());
  }

  async componentDidMount() {
    const parameters = await this.props.sdk.app.getParameters();

    this.setState(parameters ? { parameters } : this.state, () => {
      this.props.sdk.app.setReady();
    });
  }

  onConfigure = async () => {

    const currentState = await this.props.sdk.app.getCurrentState();

    return {
      parameters: this.state.parameters,
      targetState: currentState,
    };
  };

  render() {
    return (
      <Workbench className={css({ margin: '80px' })}>
        <Form>
          <Heading>App Config</Heading>
          <Paragraph>Welcome to your contentful app. This is your config page.</Paragraph>
        </Form>
      </Workbench>
    );
  }
}
