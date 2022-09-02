import React from 'react';
import { connect } from 'react-redux';
import  TreeNode  from './TreeNode';

class FileTree extends React.Component {
  render() {
    const {current,files} = this.props;

    return (
      <div>
        { (files[0].children[0].children.map((data) => {
          return (
            <TreeNode
              key={data.path}
              name={data.name}
              icon={data.icon}
              children={data.children}
              path={data.path}
              info={data}
            />
          );
        }))}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  current: state.current,
  files: state.files
});

export default connect(mapStateToProps, null)(FileTree);