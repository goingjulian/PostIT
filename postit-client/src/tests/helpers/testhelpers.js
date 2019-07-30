import * as Renderer from 'react-test-renderer'
import Enzyme, { shallow as Shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({adapter: new Adapter()});

export const shallow = Shallow;
export const renderer = Renderer;