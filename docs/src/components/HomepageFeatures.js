import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  // TODO: actually write this stuff - see https://github.com/bafnetwork/baf-wallet-v3/issues/46
  // {
  //   title: 'Easy to Use',
  //   Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
  //   description: <>something something Docusaurus is great.</>,
  // },
  // {
  //   title: 'Focus on What Matters',
  //   Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
  //   description: (
  //     <>
  //       at some point I need to write something to replace all of these shills
  //       but it's not a priority rn.
  //     </>
  //   ),
  // },
  // {
  //   title: 'Powered by React',
  //   Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
  //   description: <>actually no, svelte better.</>,
  // },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
