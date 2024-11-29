import Accordion from 'react-bootstrap/Accordion';
import CreditCardtable from './CreditCardTable';

function Accordian({ selectedCustomer, setUserDetail }) {
  return (
    <Accordion defaultActiveKey="">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Credit Cards</Accordion.Header>
        <Accordion.Body>
          <CreditCardtable 
            selectedCustomer={selectedCustomer} 
            setUserDetail={setUserDetail}
          />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default Accordian;