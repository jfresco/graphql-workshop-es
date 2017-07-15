import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import ApolloClient, { createNetworkInterface } from 'apollo-client'
import gql from 'graphql-tag'

class App extends Component {
  client = new ApolloClient({
    networkInterface: createNetworkInterface({
      uri: 'http://localhost:3001/graphql'
    })
  })

  state = {
    stories: null
  }

  async componentDidMount() {
    const result = await this.client.query({
      query: gql`
        query {
          stories(page: 2, count: 10) {
            by {
              id
              about
            }
            title
            type
          }
        }
      `
    })

    console.dir(result)
    this.setState({ stories: result.data.stories })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ul>
          {this.state.stories
            ? this.state.stories.map(story =>
              <li>{story.title}</li>)
            : <span>Loading...</span>}
        </ul>
      </div>
    );
  }
}

export default App;
