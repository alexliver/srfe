//import { useRouter } from 'next/navigation';
//import { usePathname, useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';

export const getSessionId = () : string => {
  let value = localStorage.getItem('sessionId');
  if (!value ) {
    value = uuidv4();
    localStorage.setItem('sessionId', value);
  }
  return value;
};

export const getModalStyle = ():any => {
  return {
    overlay: {
      zIndex:100,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    },
  };
}
