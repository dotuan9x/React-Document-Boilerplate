import React, {Component} from 'react';
import Loadable from 'react-loadable';
import {Layout} from 'antd';

const {Header, Content, Footer} = Layout;

import {
    MenuUnfoldOutlined,
    MenuFoldOutlined, FileDoneOutlined
} from '@ant-design/icons';

// Components
import DefaultSideBar from './Components/DefaultSideBar';
import DefaultContent from 'Modules/Layouts/Components/DefaultContent';

// Assets
import 'Assets/css/styles.less';

import {LayoutContext} from './layoutContext';

class Layouts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            component: {}
        };
    }

    componentDidMount() {
        try {
            // Validate menus
            if (this.props.menus && this.props.menus.length) {
                let selectedComponent = {};

                this.props.menus.map((menu) => {
                    if (menu.name && menu.label) {
                        if (menu.components) {
                            menu.components.map((component) => {
                                if (component.name && component.label) {
                                    // First component
                                    if (!selectedComponent.name || component.active) {
                                        selectedComponent = component;
                                    }
                                }
                            });
                        }
                    }
                });

                if (selectedComponent.name) {
                    this.setState({
                        component: selectedComponent
                    });
                }
            }

        } catch (error) {
            if (this.props.onError && typeof this.props.onError === 'function') {
                this.props.onError(error);
            }
        }
    }

     onClickItem = (value) => {
         const {key = ''} = value;

         let selectedComponent = {};

         this.props.menus && this.props.menus.map(menu => {
             if (menu.name && menu.label) {
                 menu.components.map(component => {
                     if (component.name === key) {
                         selectedComponent = component;
                     }
                 });
             }
         });

         setTimeout(() => {
             this.setState({
                 component: selectedComponent
             });
         }, 300);
     }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        });
    };

    render() {
        // Props
        const {sidebar = {}} = this.props;

        return (
            <React.Fragment>
                <LayoutContext.Provider value={this.props}>
                    <Layout style={{minHeight: '100vh'}}>
                        <DefaultSideBar collapsed={this.state.collapsed} defaultOpenKeys={sidebar.defaultOpenKeys} defaultSelectedKeys={sidebar.defaultSelectedKeys} onClickItem={this.onClickItem} />
                        <Layout className="site-layout">
                            <Header className="site-layout-background" style={{padding: 0}}>
                                {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                    className: 'trigger',
                                    onClick: this.toggle
                                })}
                            </Header>
                            <Content style={{margin: '0 16px'}}>
                                <DefaultContent component={this.state.component} />
                            </Content>
                            <Footer style={{textAlign: 'center'}}>{this.props.copyright}</Footer>
                        </Layout>
                    </Layout>
                </LayoutContext.Provider>
            </React.Fragment>
        );
    }
}

Layouts.defaultProps = {
    sidebar: {
        defaultSelectedKeys: ['icon'],
        defaultOpenKeys: ['components']
    },
    menus: [
        {
            'name': 'components',
            'label': 'Components',
            'icon': <FileDoneOutlined />,
            'components': [
                {
                    name: 'icon',
                    label: 'Icons',
                    spanColExample: 24,
                    active: true,
                    description: () => require('Components/Icon/Docs/description.md'),
                    whenToUse: () => require('Components/Icon/Docs/when-to-use.md'),
                    examples: [
                        {
                            markdown: () => require('Components/Icon/Previews/basic.md'),
                            path: Loadable({
                                loader: () => import('Components/Icon/Previews/basic.jsx'),
                                loading: () => {return null}
                            })
                        }
                    ]
                },
                {
                    name: 'calendar',
                    label: 'Calendar',
                    description: 'Tạo ra một danh sách range date cho phép người dùng chọn và cho phép chọn thời gian so sánh',
                    spanColExample: 12,
                    whenToUse: () => require('Components/Calendar/Docs/when-to-use.md'),
                    property: () => require('Components/Calendar/Docs/property.md'),
                    examples: [
                        {
                            title: 'Basic usage',
                            col: 0,
                            markdown: () => require('Components/Calendar/Previews/Basic/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/Basic/basic.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/Basic/Basic.jsx'),
                                loading: () => {return null}
                            })
                        },
                        {
                            title: 'Default rangeKey',
                            col: 1,
                            markdown: () => require('Components/Calendar/Previews/DefaultRangeKey/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/DefaultRangeKey/default-range-key.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/DefaultRangeKey/DefaultRangeKey.jsx'),
                                loading: () => {return null}
                            })
                        },
                        {
                            title: 'Default compareKey',
                            col: 0,
                            markdown: () => require('Components/Calendar/Previews/DefaultCompareKey/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/DefaultCompareKey/default-compare-key.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/DefaultCompareKey/DefaultCompareKey.jsx'),
                                loading: () => {return null}
                            })
                        },
                        {
                            title: 'onApply',
                            col: 1,
                            markdown: () => require('Components/Calendar/Previews/Apply/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/Apply/onApply.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/Apply/Apply.jsx'),
                                loading: () => {return null}
                            })
                        },
                        {
                            title: 'Customize style',
                            col: 0,
                            markdown: () => require('Components/Calendar/Previews/Custom/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/Custom/Custom.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/Custom/Custom.jsx'),
                                loading: () => {return null}
                            })
                        },
                        {
                            title: 'onChange',
                            col: 1,
                            markdown: () => require('Components/Calendar/Previews/OnChange/descripition.md'),
                            previewCode: () => require('Components/Calendar/Previews/OnChange/onchange.md'),
                            path: Loadable({
                                loader: () => import('Components/Calendar/Previews/OnChange/OnChange.jsx'),
                                loading: () => {return null}
                            })
                        }

                    ]
                }
            ]
        }
    ],
    logoUrl: 'https://ants.vn/wp-content/uploads/2015/02/Logo-website-207x60-slogan-2.png',
    copyright: 'ants.vn©2020',
    onError: () => {}
};

export default Layouts;
