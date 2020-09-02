import React from 'react';
import Editor from './';
import { default as WithTabsComponent } from './WithTabs';

const value = `
var themes = [];

function getThemes() {
  return themes;
}
`;

export default {
  title: 'Editor',
  component: Editor,
};

const Template = (args) => <Editor {...args} />;

export const Default = Template.bind({});
Default.args = {
  value,
  lineNumbers: true,
  lineWrapping: false,
  foldGutter: true,
  readOnly: false,
  autofocus: true,
};
Default.argTypes = {
  autofocus: { control: { disable: true } },
  mode: { control: { disable: true } },
  theme: { control: { disable: true } },
  onChange: { control: { disable: true } },
};

const WithTabsTemplate = (args) => <WithTabsComponent {...args} />;

export const WithTabs = WithTabsTemplate.bind({});
WithTabs.args = {
  lineNumbers: true,
  align: 'left',
};
WithTabs.argTypes = {
  value: { control: { disable: true } },
  mode: { control: { disable: true } },
  lineWrapping: { control: { disable: true } },
  readOnly: { control: { disable: true } },
  theme: { control: { disable: true } },
  foldGutter: { control: { disable: true } },
  autofocus: { control: { disable: true } },
  onChange: { control: { disable: true } },
};
