require('@babel/polyfill');
global.chrome = require('sinon-chrome');
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

jest.setTimeout(50000);
