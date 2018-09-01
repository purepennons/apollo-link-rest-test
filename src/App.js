import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { ApolloClient, InMemoryCache, gql, ApolloLink } from 'apollo-boost';
import { RestLink } from 'apollo-link-rest';
import { Query, Mutation, ApolloProvider } from 'react-apollo';
import { withClientState } from 'apollo-link-state';

// setup your `RestLink` with your endpoint
const cache = new InMemoryCache();
const restLink = new RestLink({
  uri: 'https://swapi.co/api/',
  endpoints: { 4000: 'http://localhost:4000/', v1: 'http://goolge.com.tw' }
});
const stateLink = withClientState({ cache });

// setup your client
const client = new ApolloClient({
  link: ApolloLink.from([stateLink, restLink]),
  cache
});

console.log('client', client)

const Q = gql`
query getPostById($commentId: Int!) {
    comment(commentId: $commentId) @rest(type: "Comment", path: "comments?id=:commentId", endpoint: 4000) {
      postId @export(as: "id"),
      body,
      post @rest(type: "Post", path: "posts?id=:id", endpoint: 4000) {
        title,
        author
      }
    }
  }
`

const ADD_P = gql`
  mutation add($input: NewPost!) {
    addPosts(body: $input) @rest(type: "Post", path: "posts", endpoint: 4000, method: "POST", bodyKey: "body") {
      id,
      title,
      author
    }
  }
`

client.query({
  query: Q,
  variables: {
    commentId: 2
  }
}).then(res => console.log('res', res))

client.mutate({
  mutation: ADD_P,
  variables: {
    input: {
      title: 'A Title',
      author: 'A Author'
    }
  }
}).then(v => console.log('v', v))

const PERSON = gql`
  query luke {
    person @rest(type: "Person", path: "people/1/") {
      name
    }
  }
`;
const id = 1;
const POSTS = pid => gql`
  query posts {
    post
      @rest(type: "Post", path: "posts", endpoint: 4000) {
      id @export(as: "id")
      title
      comments @rest(type: "comment", path: "comments?postId=:id", endpoint: 4000) {
        id
        postId
      }
    }
    comments(postId: $postId) @rest(type: "comment", path: "comments?postId=${pid}", endpoint: 4000) {
      id
      body
    }
  }
`;

const ADD_POST = gql`
  mutation addPost($input: NewPost!, $commentBody: NewComment!) {
    addPost(input: $input) @rest(type: "Post", path: "posts", method: "POST", endpoint: 4000) {
      id
    }

    addcomments(commentBody: $commentBody) @rest(type: "Comment", path: "comments", method: "POST", endpoint: 4000, bodyKey: "commentBody") {
      id,
      test,
      bb
    }
  }
`;

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <Query query={POSTS(2)} delay={true} variables={{ postId: 1 }} fetchPolicy="network-only">
            {props => {
              console.log('propspropspropsprops', props);
              return (
                <Mutation mutation={ADD_POST}>
                  {(addPost, p) => {
                    console.log('p', p)
                    return (
                      <div
                        onClick={e =>
                          addPost({
                            variables: {
                              input: { title: 'Akiya', author: 'Chiahao Lin' },
                              commentBody: { test: 'abc' }
                            }
                          })
                        }
                      >
                        {JSON.stringify(props.data)}
                      </div>
                    );
                  }}
                </Mutation>
              );
            }}
          </Query>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
