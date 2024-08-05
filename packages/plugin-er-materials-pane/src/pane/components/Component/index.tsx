import * as React from 'react';
import cls from 'classnames/bind';
import Svg from '../../Icon/Component';
import { Balloon } from '@alifd/next';
import style from './index.module.scss';
import { getTextReader, StandardComponentMeta } from '../../utils/transform';

const cx = cls.bind(style);

interface Props {
  data: any;
}

interface State {
  icon: string | React.ReactNode;
  snippet: any;
}

export default class Component extends React.Component<Props, State> {
  static getDerivedStateFromProps(props) {
    const { data } = props;
    const { icon, snippets = [] } = data;
    const snippet = snippets[0];
    const screenshot = snippet?.screenshot ?? icon;

    return {
      icon: screenshot,
      snippet,
    };
  }

  state = {
    icon: '',
    snippet: null,
  };

  t: (s) => string;

  constructor(props) {
    super(props);
    this.t = getTextReader('zh_CN');
  }

  renderIcon() {
    const { icon } = this.state;

    if (!icon) {
      return <Svg className={cx('no-icon')} />;
    }

    if (typeof icon === 'string') {
      return <img src={icon} alt="" />;
    }

    if (typeof icon === 'function') {
      const X = icon as any;
      return <X />;
    }

    return icon;
  }

  render() {
    const { data } = this.props;
    const { title } = data;
    const { snippet } = this.state;

    return (
      <div className={cls('snippet', cx('card'))} data-id={snippet.id} title={this.t(title)}>
        <div className={cx('icon')}>{this.renderIcon()}</div>
        <div className={cx('name')}>{this.t(title)}</div>
      </div>
    );
  }
}
