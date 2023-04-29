import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
// Material UI Elements
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Person2RoundedIcon from '@mui/icons-material/Person2Rounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
// AWS Elements
import { withAuthenticator } from "@aws-amplify/ui-react";
import { API, Auth, withSSRContext, graphqlOperation } from "aws-amplify";
import { listMessages } from "../graphql/queries";
import { createMessage } from "../graphql/mutations";
import Message from "../components/message";
import { onCreateMessage } from "../graphql/subscriptions";

function generate(element) {
  return [0, 1, 2].map(function (value) {
      return React.cloneElement(element, {
          key: value,
      });
  });
}

function Home({ messages }) {
  const [stateMessages, setStateMessages] = useState([...messages]);
  const [messageText, setMessageText] = useState("");
  const [user, setUser] = useState(null);
  // profile menu variables
  const [anchorProfileMenu, setAnchorProfileMenu] = React.useState(null);
  // user list variables
  const [anchorUserList, setAnchorUserList] = React.useState(null);
  const [secondary, setSecondary] = React.useState(false);

  useEffect(() => {
    document.title = 'ChatNow Beta - Online Chatroom';
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const amplifyUser = await Auth.currentAuthenticatedUser();
        setUser(amplifyUser);
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();

    // Subscribe to creation of message
    const subscription = API.graphql(
      graphqlOperation(onCreateMessage)
    ).subscribe({
      next: ({ provider, value }) => {
        setStateMessages((stateMessages) => [
          ...stateMessages,
          value.data.onCreateMessage,
        ]);
      },
      error: (error) => console.warn(error),
    });
  }, []);

  useEffect(() => {
    async function getMessages() {
      try {
        const messagesReq = await API.graphql({
          query: listMessages,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
        setStateMessages([...messagesReq.data.listMessages.items]);
      } catch (error) {
        console.error(error);
      }
    }
    getMessages();
  }, [user]);

  const handleSubmit = async (event) => {
    // Prevent the page from reloading
    event.preventDefault();

    // clear the textbox
    setMessageText("");

    const input = {
      // id is auto populated by AWS Amplify
      message: messageText, // the message content the user submitted (from state)
      owner: user.username, // this is the username of the current user
    };

    // Try make the mutation to graphql API
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createMessage,
        variables: {
          input: input,
        },
      });
    } catch (err) {
      console.error(err);
    }
    window.scrollTo(0, document.body.scrollHeight);

  };

  // Profile Menu Functions
  const handleClose = () => {
    setAnchorProfileMenu(null);
  };
  // temp, need to integrate with handleClose
  const handleCloseUserList = () => {
    setAnchorUserList(null);
  }
  const handleDeleteAccount = () => {
    // blank slate
    if (user !== null) {
      // delete account here
      handleClose();
    }
  };
  const handleLogOut = () => {
    return new Promise((success) => {
      if (user !== null) {
        user.signOut();
        handleClose();
        window.location.reload();
      }
      success();
    });
  };
  const showProfileMenu = (event) => {
    setAnchorProfileMenu(event.currentTarget);
  };
  const showUserList = (event) => {
    setAnchorUserList(event.currentTarget);
  };

  if (user) {
    return (
      <div className={styles.background}>
        <div className={styles.container}>
          <div className={styles.header}>
            <label htmlFor="icon-button-user-profile">
              {/* user list - click to view all */}
              <div className={styles.buttonContainer}>
                <button
                  className={styles.buttonUserList}
                  onClick={showUserList}
                  aria-label="user list" 
                  aria-controls="simple-list"
                  aria-haspopup="true"
                >
                  5
                </button>
                <Menu
                  keepMounted
                  anchorEl={anchorUserList}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  PaperProps={{
                    style: {
                      marginTop: "3rem",
                      backgroundColor: "transparent",
                      boxShadow: "none"
                    }
                  }}
                  onClose={handleCloseUserList}
                  open={Boolean(anchorUserList)}
                >
                  <List 
                    className={styles.list}
                    dense={true}
                    keepMounted
                    anchorEl={anchorUserList}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    onClose={handleCloseUserList}
                    open={Boolean(anchorUserList)}
                    >
                    {generate(
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete">
                            <CircleRoundedIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Person2RoundedIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Chat User"
                          secondary={secondary ? 'Secondary text' : null}
                        />
                      </ListItem>,
                    )}
                  </List>
                </Menu>
              </div>
            </label>
            <h1 className={styles.title}>Welcome!</h1>
            <label htmlFor="icon-button-user-profile">
              {/* Profile Menu */}
              <div className={styles.buttonContainer}>
                <button
                  className={styles.buttonUserProfile}
                  onClick={showProfileMenu}
                  aria-label="user profile" 
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                >
                  {user.username}
                </button>
                <Menu
                  keepMounted
                  anchorEl={anchorProfileMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  PaperProps={{
                    style: {
                      marginTop: "3.5rem",
                      borderRadius: "18px",
                      backgroundColor: "#eef2fb",
                      boxShadow: "0px 4px 0px rgba(0, 0, 0, 0.1)"
                    }
                  }}
                  onClose={handleClose}
                  open={Boolean(anchorProfileMenu)}
                >
                  <MenuItem onClick={handleDeleteAccount}>Delete Account</MenuItem>
                  <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                </Menu>
              </div>
            </label>
          </div>
          <div className={styles.chatbox}>
            {stateMessages
              // sort messages oldest to newest client-side
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((message) => (
                // map each message into the message component with message as props
                <Message
                  message={message}
                  user={user}
                  isMe={user.username === message.owner}
                  key={message.id}
                />
              ))}
          </div>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formBase}>
              <input 
                accept="image/*" 
                src="src/assets/round_add_a_photo_black_48dp.png"
                id="icon-button-file"
                type="file" 
                onChange={(e) => storeFile(e)}
                style={{ display: 'none' }}/>
              <label htmlFor="icon-button-file">
                <button
                  className={styles.buttonImage}
                  color="primary" 
                  aria-label="upload picture" 
                  component="span">
                    <img src="https://amplify-livechat-awschat-183131-assets.s3.us-east-1.amazonaws.com/photo.svg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCdlP%2BhhNROsRedK0PyNg93YK946Fnn1t9o5V9I3w%2F9XgIhAJPxIFBlywXLUqX9HtnSCXMBzUqWu1FBoT4ps7wSfZDZKvECCMb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMNTY5NjkwNTY5NjM4IgyYUyaoqf78%2Bw6xlTMqxQLGxQ2RJlUiKlih4QJd5PAMrYWuaGLLd5n5TApzLVczImrlujOyLYdpzpLG0iHlZRg3boMMEvvbSwpuOmWSnGPa0tG9igWcaDU1si6PkEpVRhD8iVFn99jUu%2BAZdob4gGor7sTxpi2rinw3Imp4gHI13PHUyTjwdZwD%2BwLbfNDIH8mH9nTRcfFR0Sd3oZlIpTkNjY4gXMS%2BZpcer%2F70v1O18Mu6HvGEpCx55RInyW%2FoWEnMBKBFwgkDGIsOx2uYebPhnAcZMI%2BoqX4GHOB9LIuZYPM8wu0pkDeW9kpEJaCeVeWxu8uvqkmCc7ZkN7haHOXKEjYGMC%2FQpKiOE8mkD7Rj00TQwR7g2EGz4Yi0UaFogw04FlzGmhnA65Bx3obKtTBhZO%2Bk26zMWJZYeivTgi4hj5Rqt%2BtlI%2F%2F99JnfjIva8K2N6BDoMMeOkaIGOrICGk9OairoXw5KRiMhAxnmjWw9mpQGORr2282eLXz1C8wATvUDb9bEnq1BHZ77Kv%2FZF%2BlFb9VxyiEit7z9snV8cwguNcrVTjXgyoNqr1ciqvUux%2FPIGrqh3tQlS%2BU%2FP99bHssMpHzWDq2dxCkoJdaBgXC0NJmlPZb5EnErsnOor%2BI%2BGcsoBR9ehjHISDQ8KnKx8Bw3bsqn2d57PtETN66aVpzv3kky9ecuM9lnKvL5SOPfhQrPrT%2Faf4xD4U1ERieBwwMBWFgZZamq5UTNGZm56llOurQDZDvTMdKu9TEgaCxyXxAQJ3AxYORL%2BCMPGnqmyeqfKfv%2FofYY%2FhNQMENFreoO%2FUgnWQomPikW1d6UXtNaqjXgveu4zvXGpbs8wJL7kxQDpbAhHmr0BL5svHrpCd1x&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230422T215956Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAYJJBUHOTG7SCIYGG%2F20230422%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=afa04fbdb0d272cc5c67a4b626f69661b02bbcc34fd86d5b79d6978125e7eca0"/>
                </button>
              </label>
              <input
                type="text"
                autoComplete="off"
                id="message"
                name="message"
                autoFocus
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Send a message to the chat"
                className={styles.textBox}
              />
              <button className={styles.buttonSend} style={{ marginLeft: "8px" }}>Send</button>
            </form>
          </div>
        </div>
      </div>
    );
  } else {
    return <p>Loading...</p>;
  }
}

export default withAuthenticator(Home);

export async function getServerSideProps({ req }) {
  // wrap the request in a withSSRContext to use Amplify functionality serverside.
  const SSR = withSSRContext({ req });

  try {
    // currentAuthenticatedUser() will throw an error if the user is not signed in.
    const user = await SSR.Auth.currentAuthenticatedUser();

    // If we make it passed the above line, that means the user is signed in.
    const response = await SSR.API.graphql({
      query: listMessages,
      // use authMode: AMAZON_COGNITO_USER_POOLS to make a request on the current user's behalf
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    // return all the messages from the dynamoDB
    return {
      props: {
        messages: response.data.listMessages.items,
      },
    };
  } catch (error) {
    // We will end up here if there is no user signed in.
    // We'll just return a list of empty messages.
    return {
      props: {
        messages: [],
      },
    };
  }
}
