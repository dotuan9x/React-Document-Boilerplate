// Libraries
import React, {useContext} from 'react';
import {Card, Row, Col, Tag} from 'antd';

// Styles
import styles from './styles.module.less';

// Utils
import {handleError} from 'Src/utils';

// Context
import {LayoutContext} from 'Modules/Layouts/layoutContext';

const PATH = 'Components/Overview/index.jsx';

const Overview = (props) => {
    // Props
    const properties = useContext(LayoutContext).state.layout;
    const {setComponentSelected} = useContext(LayoutContext);

    const {menus = []} = properties;

    const showRenderComponents = () => {
        try {
            return menus.map(component => {
                return showRenderSubComponents(component);
            });
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    };

    const onClickOverview = (key) => {
        setComponentSelected(key);
    };

    const showRenderSubComponents = (component) => {
        try {
            if (component.components && component.components.length) {
                return (
                    <div key={component.name}>
                        <h2>{component.label}</h2>
                        {component.components.map(childComponent => {
                            return showRenderSubComponents(childComponent);
                        })}
                    </div>
                );
            } else {
                if (component.child && component.child.length) {
                    return (
                        <div key={component.name} style={{paddingLeft: 20}}>
                            <strong style={{color: 'rgba(0, 0, 0, 0.45)'}}>{component.label} <Tag style={{color: 'rgba(0, 0, 0, 0.45)'}}>{component.child.length}</Tag></strong>
                            <Row gutter={[20, 20]} style={{marginTop: 10}}>
                                {component.child.map(childComponent => {
                                    if (childComponent.image) {
                                        return (
                                            <Col key={childComponent.name} onClick={() => onClickOverview(childComponent.name)}>
                                                <Card className={styles['wrapper-card']} title={childComponent.label} size='small' style={{width: 200}}>
                                                    <div className={styles['card']} >
                                                        <img alt={childComponent.label} width={150}  src={childComponent.image} className={styles['image-background']} />
                                                    </div>
                                                </Card>
                                            </Col>
                                        );
                                    }
                                })}
                            </Row>
                        </div>
                    );
                }
            }
        } catch (error) {
            handleError(error, {
                path: PATH
            });
        }
    };

    return (
        <div>
            {showRenderComponents()}
        </div>
    );
};

Overview.propTypes = {};

export default Overview;
