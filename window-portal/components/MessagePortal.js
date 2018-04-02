import React, { Component, Fragment } from 'react';

import WindowPortal from './WindowPortal';
import SavedMessage from './SavedMessage';
import Status from './Status';
import Loading from './Loading';

import { createHtml } from '../actions/createHtml';
import copyStyles from '../utils/copyStyles';

import { types, messages } from '../constants/status';

class MessagePortal extends Component {
    state = {
        isPortalOpen: false,
        status: null,
    };

    handleSubmit = id => {
        // open the portal and show a status message
        this.setState({
            status: {
                type: types.UPDATING,
                message: messages.UPDATING_MESSAGE,
            },
            isPortalOpen: true,
        });

        // this will also be conditional
        this.handleOpenPortal();

        // Fake async action that returns some markup once it's been "uploaded"
        // What this is really meant to simulate is an action that uploads some
        // markup to a webserver then returns the URL of that document.

        const { message } = this.props;

        createHtml(message)
            .then(markup => {
                // Can't do this because it will be blocked by a pop-up blocker.
                // event context is lost in the async createHtml action, thus won't
                // be a "trusted" user initiated event. We should open the portal first.

                // this will be enabled by state to simulate what happens with the pop-up blocker
                // this.handleOpenPortal(markup);

                this.setState({
                    status: {
                        type: types.SUCCESS,
                        message: messages.SUCCESS_MESSAGE,
                    },
                    markup,
                });
            })
            .catch(error => {
                // this should demonstrate an error rendered into the portal.
                this.setState({ status: { type: types.ERROR, message: error.message } });
            });
    };

    handleOpenPortal = () => {
        // close any alreay opened windows
        if (this.portalWindow) this.portalWindow.close();

        // this is to demonstrate if called after the async function it won't open.
        // catch to display the error to the user.
        try {
            this.portalWindow = window.open('', 'WINDOW_PORTAL');
            const { document: portalDoc } = this.portalWindow.window;

            // copy source doc styles to portal window
            copyStyles(window.document, portalDoc);

            // Portal element we will render into
            this.portalEl = portalDoc.createElement('div');
            this.portalEl.id = 'root';
            portalDoc.body.appendChild(this.portalEl);
        } catch (error) {
            this.setState({
                status: {
                    type: types.ERROR,
                    message: error.message,
                },
            });
        }
    };

    render() {
        const { id, title } = this.props.message;
        const { status, isPortalOpen, markup } = this.state;

        return (
            <Fragment>
                <SavedMessage id={id} title={title} handleSubmit={this.handleSubmit}>
                    {/* should be conditional whether portal is open */}
                    {status && (
                        <Fragment>
                            <Status status={status} />
                            {status.type === types.UPDATING && <Loading />}
                        </Fragment>
                    )}
                </SavedMessage>
                {isPortalOpen && (
                    <WindowPortal markup={markup} status={status} el={this.portalEl} />
                )}
            </Fragment>
        );
    }
}

export default MessagePortal;
