'use strict';

export const ConfirmDialog = React.createClass({
  getInitialState: function() {
    return {
      isModalOpen: false
    };
  },
  handleSend: function () {
    this.setState({isModalOpen: false});
  },
  handleCancel: function () {
    this.setState({isModalOpen: false});
  },
  render: function() {

    return (
      <Modal isVisible={this.state.isModalOpen} onClose={() => this.closeModal()}>
          <Text>This message makes you look like a jerk. Are you sure you want to send it?</Text>
          <Button
            style={{fontSize: 20, color: 'red'}}
            styleDisabled={{color: 'red'}}
            onPress={this.handleSend}
          >
            I don`t care - send it anyway
          </Button>
          <Button
            style={{fontSize: 20, color: 'green'}}
            styleDisabled={{color: 'red'}}
            onPress={this.handleCancel}
          >
            I`ll sleep on it
          </Button>
      </Modal>
    );
  }
});
