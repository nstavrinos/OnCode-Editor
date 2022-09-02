import React from 'react';
import PropTypes from 'prop-types';
import  File  from './File.js';
import  Folder  from './Folder.js';


class TreeNode extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      open: true,
    };

    this.toggleFolder = this.toggleFolder.bind(this);
  }

  toggleFolder() {
    this.setState({
      open: !this.state.open,
    });
   
  }

  render() {   

    if (this.props.children) {

      return (
        <div>
          <Folder
            name={this.props.name}
            open={this.state.open}
            toggleFolder={this.toggleFolder}
            info={this.props.info}
            path={this.props.path}
          />
          {
            this.state.open &&
            <div style={{ padding: '0 0 0 8px'}}>
              {
                this.props.children.map((child) => (
                 
                  <TreeNode
                    key={child.path}
                    name={child.name}
                    icon={child.icon}
                    children={child.children}
                    path={child.path}
                    info={child}
                  />
                ))
              }
            </div>
          }
        </div>
      );
    } else {
      return (
        <File
          name={this.props.name}
          icon={this.props.icon}
          path={this.props.path}
          info={this.props.info}
        />
      );
    }
  }
}

TreeNode.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  children: PropTypes.array,
  path: PropTypes.string,
  info: PropTypes.object
};



export default TreeNode;