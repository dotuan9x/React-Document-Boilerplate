// Libraries
import React, {Component} from 'react';
import marked from 'marked';
import htmlparser2 from 'html-to-jsonml';
import toReactElement from 'jsonml-to-react-element';
import hljs from 'highlight.js';
import {Breadcrumb, Row, Col, Spin, Divider} from 'antd';

// Context
import {LayoutContext} from 'Modules/Layouts/layoutContext';

// Components
import PreviewCode from 'Components/PreviewCode/PreviewCode.jsx';
import Overview from 'Components/Overview';
import ChangeLog from 'Components/ChangeLog/index.jsx';

// Utils
import {random, handleError} from 'Src/utils';

// Assets
import 'highlight.js/styles/tomorrow.css';
import './style.less';

const PATH = 'Modules/Layouts/Components/DefaultContent/index.jsx';

class Components extends Component {
    static contextType = LayoutContext;

    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            preview: null,
            jsonMLRender: null,
            isShowLoading: true,
            name: '',
            component: {}
        };
    }

    componentDidMount() {
        try {
            this.updateCodeSyntaxHighlighting();

            if (this.props.component && this.props.component.name) {
                this.getComponent(this.props.component).then(component => {
                    this.setState({
                        name: this.props.component.name,
                        component,
                        isShowLoading: false
                    });
                });
            }

        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    componentDidUpdate() {
        try {
            this.updateCodeSyntaxHighlighting();

            // Update component
            if (!this.state.name || this.state.name !== this.props.component.name) {
                this.state.isShowLoading === false && this.setState({
                    isShowLoading: true
                });

                this.getComponent(this.props.component).then(component => {
                    this.setState({
                        name: this.props.component.name,
                        component,
                        isShowLoading: false
                    });
                });
            }
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    updateCodeSyntaxHighlighting = () => {
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightBlock(block);
        });
    };

    getMarkdown = (readmePath) => {
        try {
            return fetch(readmePath)
                .then(response => {
                    return response.text();
                }).then(response => {
                    const tokens = marked.lexer(response);
                    const html = marked.parser(tokens);

                    // Sau khi parse sang html thì cần custom lại vì nó chưa các kí tự như xuống hàng
                    const removeMeaningless = (rows) => {
                        const newRows = [];

                        if (rows && rows.length) {
                            for (let i = 0; i < rows.length; i++) {
                                const element = rows[i];

                                if (Array.isArray(element)) {
                                    const newElement = removeMeaningless(element);

                                    if (newElement) {
                                        newRows.push(newElement);
                                    }
                                } else if (typeof element === 'object') {

                                    newRows.push(element);
                                } else {
                                    if (element.charCodeAt() !== 10) {
                                        newRows.push(element);
                                    }
                                }

                            }
                        }

                        return newRows;
                    };

                    const jsonML = htmlparser2(html);

                    // htmlparser2 will auto add html, head, body so we need to custom it again
                    const removeParent = jsonML[3];

                    removeParent[0] = 'section';

                    return removeMeaningless(removeParent);
                });
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    getComponent = async (component) => {
        try {
            let result = {};
            const examples = [];

            if (component) {
                if (Array.isArray(component.examples)) {
                    for (const r of component.examples) {
                        let previewCode = null;
                        let markdown = null;
                        let styles = null;

                        if (r.markdown) {
                            let markdownPath = r.markdown;

                            if (typeof markdownPath === 'function') {
                                markdownPath = markdownPath();
                            }

                            markdown = await this.getMarkdown(markdownPath);
                        }

                        if (r.previewCode) {
                            let previewCodePath = r.previewCode;

                            if (typeof previewCodePath === 'function') {
                                previewCodePath = previewCodePath();
                            }

                            previewCode = await this.getMarkdown(previewCodePath);
                        }

                        if (r.styles) {
                            let previewStylesPath = r.styles;

                            if (typeof previewStylesPath === 'function') {
                                previewStylesPath = previewStylesPath();
                            }

                            styles = await this.getMarkdown(previewStylesPath);
                        }

                        examples.push({
                            title: r.title,
                            col: r.col,
                            preview: r.path,
                            styles,
                            previewCode,
                            markdown
                        });
                    }
                }

                let whenToUse = null;
                let property = null;
                let description = null;
                let changeLog = null;

                if (component.changeLog) {
                    let changeLogPath = component.changeLog;

                    if (typeof changeLogPath === 'function') {
                        changeLogPath = changeLogPath();
                    }

                    changeLog = await this.getMarkdown(changeLogPath);
                }

                if (component.whenToUse) {
                    let readmePath = component.whenToUse;

                    if (typeof readmePath === 'function') {
                        readmePath = readmePath();
                    }

                    whenToUse = await this.getMarkdown(readmePath);
                }

                if (component.property) {
                    let readmePath = component.property;

                    if (typeof readmePath === 'function') {
                        readmePath = readmePath();
                    }

                    property = await this.getMarkdown(readmePath);
                }

                if (component.description && typeof component.description === 'function') {
                    let readmePath = component.description;

                    if (typeof readmePath === 'function') {
                        readmePath = readmePath();
                    }

                    description = await this.getMarkdown(readmePath);
                }

                result = {
                    ...result,
                    title: component.label || 'Component title',
                    name: component.name || 'over-view',
                    description: typeof component.description !== 'function' ? component.description || 'This is description of component' : description,
                    spanColExample: component.spanColExample || 24,
                    whenToUse,
                    property,
                    examples,
                    changeLog
                };
            }

            return result;
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    preview = (component, props) => {
        return React.createElement(component, props);
    }

    showRenderExamples = () => {
        try {
            if (this.state.component) {
                const {spanColExample = 24, examples} = this.state.component;

                const numberOfCol = 24 / spanColExample;

                let newExamples = [];

                for (let i = 0; i < numberOfCol; i++) {
                    newExamples.push(<Col key={i} span={spanColExample}>
                        {
                            Array.isArray(examples) && examples.map((example) => {
                                const {col = 0} = example;

                                if (col === i) {
                                    return (
                                        <Col key={random(8)} span={24}>
                                            <div className="example">
                                                <Row>
                                                    <div className="preview" style={{width: '100%'}}>
                                                        {example.preview ? this.preview(example.preview) : null}
                                                    </div>
                                                </Row>
                                                {example.title && <>
                                                    <Divider orientation="left">
                                                        <div style={{fontWeight: 500}}>{example.title && example.title}</div>
                                                    </Divider>
                                                    <Row>
                                                        <Col span={24}>
                                                            <div className="markdown">
                                                                {example.markdown && toReactElement(example.markdown)}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </>}
                                                {example.previewCode && <PreviewCode styles={example.styles ? toReactElement(example.styles) : null} code={toReactElement(example.previewCode)} />}
                                            </div>
                                        </Col>
                                    );
                                }
                            })
                        }
                    </Col>);
                }

                return newExamples;
            }
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    showRenderContent = (key) => {
        try {
            switch (key) {
                case 'over-view':
                    return  <Overview onClickComponentView={this.props.onClickComponentView} />;
                case 'change-log':
                    return <ChangeLog changeLog={this.state.component.changeLog} />;
                default:
                    return (
                        <>
                            <h2 id='when-to-use'>When To Use</h2>
                            <Row>
                                <Col span={24}>
                                    {this.state.component && this.state.component.whenToUse ? toReactElement(this.state.component.whenToUse) : null}
                                </Col>
                            </Row>
                            <h2>Examples</h2>
                            <Row gutter={[8, 16]}>
                                {this.showRenderExamples()}
                            </Row>
                            {
                                this.state.component && this.state.component.property ? (
                                    <>
                                        <h2>Property</h2>
                                        <Row style={{width: '100%'}}>
                                            <Col span={24}>
                                                {this.state.component && this.state.component.property ? toReactElement(this.state.component.property) : null}
                                            </Col>
                                        </Row>
                                    </>
                                ) : null
                            }
                            {
                                this.state.component.changeLog ? (
                                    <>
                                        <h2>Change Log</h2>
                                        <ChangeLog changeLog={this.state.component.changeLog} />
                                    </>
                                ) : null
                            }
                        </>
                    );
            }
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    }

    render() {
        const {title, name} = this.state.component;

        return (
            <React.Fragment>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item>Components</Breadcrumb.Item>
                    <Breadcrumb.Item>{title}</Breadcrumb.Item>
                </Breadcrumb>
                <div className="site-layout-background markdown" style={{padding: 24, minHeight: 360}}>
                    <Spin spinning={this.state.isShowLoading}>
                        <h1>{title}</h1>
                        {
                            this.state.component && this.state.component.description ? typeof this.state.component.description !== 'string' ?
                                <div className='description-mark-down'>{toReactElement(this.state.component.description)}</div> : <p>{this.state.component.description}</p> : null
                        }
                        {this.showRenderContent(name)}
                    </Spin>
                </div>
            </React.Fragment>
        );
    }
}

export default Components;
