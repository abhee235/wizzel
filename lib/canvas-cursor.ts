export const base64Encode = (str) => {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(str); // Client-side
    } else {
      return Buffer.from(str, 'utf-8').toString('base64'); // Server-side
    }
  };
  
  export const getSelectionCursor = () => {
    const rotate = `<svg fill="#000000" width="20px" height="20px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" transform="rotate(270)" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="0.4800000000000001"><path d="M3,10.714,21,3,13.286,21,12,12Z"></path></g><g id="SVGRepo_iconCarrier"><path d="M3,10.714,21,3,13.286,21,12,12Z"></path></g></svg>`;
    return `data:image/svg+xml;base64,${base64Encode(rotate)}`;
  };
  
  const getRotationCursor = () => {
    const rotate = `<svg fill="#000000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 482.097 482.097" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="28.925819999999998"> <path d="M481.803,313.519l-39.382-134.041c-0.839-2.773-3.257-4.805-6.145-5.111c-2.903-0.322-5.693,1.129-7.08,3.66l-22.305,40.436 c-96.09-78.836-235.602-78.854-331.691-0.018l-22.291-40.418c-1.4-2.531-4.193-3.982-7.094-3.66 c-2.889,0.307-5.289,2.338-6.127,5.111L0.301,313.519c-0.762,2.533-0.051,5.275,1.824,7.113c1.852,1.889,4.578,2.582,7.125,1.855 l134.008-39.402c2.811-0.822,4.822-3.256,5.131-6.145c0.338-2.887-1.129-5.691-3.676-7.078l-32.033-17.662 c75.594-57.576,181.117-57.576,256.713,0l-32.016,17.662c-2.529,1.387-4,4.191-3.676,7.078c0.309,2.889,2.32,5.322,5.127,6.145 l134.011,39.402c2.548,0.727,5.288,0.033,7.126-1.855C481.854,318.794,482.549,316.052,481.803,313.519z"></path> </g><g id="SVGRepo_iconCarrier"> <path d="M481.803,313.519l-39.382-134.041c-0.839-2.773-3.257-4.805-6.145-5.111c-2.903-0.322-5.693,1.129-7.08,3.66l-22.305,40.436 c-96.09-78.836-235.602-78.854-331.691-0.018l-22.291-40.418c-1.4-2.531-4.193-3.982-7.094-3.66 c-2.889,0.307-5.289,2.338-6.127,5.111L0.301,313.519c-0.762,2.533-0.051,5.275,1.824,7.113c1.852,1.889,4.578,2.582,7.125,1.855 l134.008-39.402c2.811-0.822,4.822-3.256,5.131-6.145c0.338-2.887-1.129-5.691-3.676-7.078l-32.033-17.662 c75.594-57.576,181.117-57.576,256.713,0l-32.016,17.662c-2.529,1.387-4,4.191-3.676,7.078c0.309,2.889,2.32,5.322,5.127,6.145 l134.011,39.402c2.548,0.727,5.288,0.033,7.126-1.855C481.854,318.794,482.549,316.052,481.803,313.519z"></path> </g></svg>`;
    return `data:image/svg+xml;base64,${base64Encode(rotate)}`;
  };
  
  const resizeCursor = () => {
    // const resize = `<svg fill="#000000" height="256px" width="256px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 251.25 251.25" xml:space="preserve" stroke="#000000" stroke-width="0.00251247"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M248.611,119.259l-51.005-51.005c-3.516-3.515-9.213-3.515-12.729,0c-3.515,3.515-3.515,9.213,0,12.728l35.642,35.641 H30.728l35.642-35.641c3.515-3.515,3.515-9.213,0-12.728c-3.516-3.515-9.213-3.515-12.729,0L2.636,119.259 c-3.515,3.515-3.515,9.213,0,12.728l51.005,51.005c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636 c3.515-3.515,3.515-9.213,0-12.728l-35.642-35.641h189.791l-35.642,35.641c-3.515,3.515-3.515,9.213,0,12.728 c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l51.005-51.005C252.125,128.472,252.125,122.774,248.611,119.259z"></path> </g></svg>`;
    // //   const resize = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 330 330" style="enable-background:new 0 0 330 330;" xml:space="preserve">
    // // <path id="XMLID_21_" d="M79.394,250.606C82.323,253.535,86.161,255,90,255c3.839,0,7.678-1.465,10.606-4.394
    // // 	c5.858-5.857,5.858-15.355,0-21.213L51.213,180h227.574l-49.393,49.394c-5.858,5.857-5.858,15.355,0,21.213
    // // 	C232.322,253.535,236.161,255,240,255s7.678-1.465,10.606-4.394l75-75c5.858-5.857,5.858-15.355,0-21.213l-75-75
    // // 	c-5.857-5.857-15.355-5.857-21.213,0c-5.858,5.857-5.858,15.355,0,21.213L278.787,150H51.213l49.393-49.394
    // // 	c5.858-5.857,5.858-15.355,0-21.213c-5.857-5.857-15.355-5.857-21.213,0l-75,75c-5.858,5.857-5.858,15.355,0,21.213L79.394,250.606z
    // // 	"></path>
    // // </svg>`;
    // return `data:image/svg+xml;base64,${base64Encode(resize)}`;
    //return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAA9FJREFUWEftmF1IU2Ecxp+yTLdROB1KrSXkjQheTBAMCr9HiIE0QYLKm80QatgUL4Q2dQ6daeKFglNDtPzKiBCvtroRUtJkiW6akB+Vjb5MESsr4384JwYRuXPktIu98MK5OIf99rzv/3mf/7sPAT72BTgfgoBCVyioYCApSKtBc4edQtmY7/diiUMAhM7MzKRERkYmulwuh0ajeQFgG8BPoZRCAQ8ACF9dXTXHxMRcX1hYQFxcHDwejz4+Pv4ugC8AfgiBFAJIcJKVlZUqpVJpaGxshNFoxMDAAPLz8zE1NVWsVqu7AWwJgeQLyMAtLS1Vq1Sqa62trQzc1haxYE8h+QDuZ5WzkHINDQ2ora0FQZJyNTU1qKio+A05PT19JTExkVOSCsivwQcwNDs7+9jIyMiM1WoN7+zsZODCwsKQlpaGnZ0dNDc3w2AwMJBZWVkTERERZwGsAfjuFx3PKpbU19cnl5aWPq6srERubi6USqV3dnY2mgMkiN7eXszNzaGsrOylTCY7A+AdgK9iAEoBRLvd7luxsbGpy8vLi/Pz869lMtlZDtBms90uKCg4pVAoFB6P54FarTaJCXgIQASAGAByAIcdDselkJCQPA7QZDJVV1VVPQXwGcAHAF72mbzRr8FnD5IxhwEgJWUEOTo6WrK9vX2BA2xqajKWlJQ4WKhNADRpef02bj6ApABVMlkNgUZNTEzc2NjYuMwBtre3F+t0uodsYXxjfdBvuL046kIBKCYnJy3r6+uFHGBXV1dRYWHhfQCfhJh0EDCo4C78ILgHhdgM+WH4P2yGqpjMmTKhaDbDGPXa2ppNKpWe83q904uLi598jbqvr69ao9GclkqlRzc3Nx/I5XKzmEZ9aHh4+FROTs4js9mMvLw8qFSqVy6XS+kbFvr7++F2u1FeXr4gkUhSxDzqpElJScfHxsYmLRaLpLu7Gx0dHUw9+Zwk0Ol0TNzKzMx8JpfLzwF4L1aakVBQGB8fNycnJ18kFSkPtrS0QKvVoq6ujlT7HViHhoZMWq2W/oFogGQtkQBOOJ1OY3p6upYgbTbbH5Hfbrff1Ov1dwC8EjOwMpGfzmAASofDYcjIyDhPkBRguaapra3tVlFR0QAL95FtnkSJ/LTdmKaJhTzmdDqvkpKcsdvt9ka9Xn8PwBs2D/Lu7Pj6oC9kFO1Jq9WampCQcHJwcPBJT0/PcwBvAXDK8e6NhQBykGTWRyhZAzjIViol6fX/3bhzK8pcfbCTnqlzo/QcEFcfvnmCiodGwF0e7SL08H9F6B7k/8u7/DIIuEuh/vraL8P75zht/FEsAAAAAElFTkSuQmCC`;
  };
  
  // Tagged template
  function resizeCursorIcon(angle) {
    const relativeAngle = angle - 90;
    const pos = {
        '-90': '9.25 5.25',
        '-75': '9.972 3.863',
        '-60': '10.84 1.756',
        '-45': '0 0',
        '-30': '18.83 0.17',
        '-15': '28.49 -9.49',
        15: '-7.985 46.77',
        30: '-0.415 27.57',
        45: '2.32 21.713',
        60: '3.916 18.243',
        75: '4.762 16.135',
        90: '5.25 14.75',
        105: '5.84 13.617',
        120: '6.084 12.666',
        135: '6.317 12.01',
        150: '6.754 11.325',
        165: '7.06 10.653',
        180: '7.25 10',
        195: '7.597 9.43',
        210: '7.825 8.672',
        225: '7.974 7.99',
        240: '8.383 7.332',
        255: '8.83 6.441',
      },
      defaultPos = '7.25 10';
    const transform = `rotate(${angle})`;
    // relativeAngle === 0
    //   ? 'translate(9.5 3.5)'
    //   : `rotate(${relativeAngle} translate(100 -9)`; // ${pos[relativeAngle] || defaultPos})`;
    const imgCursor = encodeURIComponent(
      //   `<svg width="20px" height="20px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000" transform='${transform}'>
      //     <defs>
      //   <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      //     <feDropShadow dx="1" dy="1" stdDeviation=".7" flood-color="rgba(0, 0, 0, 0.5)" />
      //   </filter>
      // </defs>
  
      // <!-- Apply the shadow filter to your elements -->
  
      //     <g id="SVGRepo_tracerCarrier" filter="url(#shadow)" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="32.768"><title>ionicons-v5-c</title><polyline points="304 96 416 96 416 208" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></polyline><line x1="405.77" y1="106.2" x2="111.98" y2="400.02" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></line><polyline points="208 416 96 416 96 304" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></polyline></g><g id="SVGRepo_iconCarrier"><title>ionicons-v5-c</title><polyline points="304 96 416 96 416 208" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></polyline><line x1="405.77" y1="106.2" x2="111.98" y2="400.02" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></line><polyline points="208 416 96 416 96 304" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></polyline></g></svg>`
  
      `<svg fill="#000000" viewBox="0 0 32 32" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" transform='${transform}'>
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0, 0, 0, 0.5)" />
      </filter>
    </defs>
    <!-- Apply the shadow filter directly to the visible elements -->
   
   
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="2.488">
      <path d="M21.92,2.62a1,1,0,0,0-.54-.54A1,1,0,0,0,21,2H15a1,1,0,0,0,0,2h3.59L4,18.59V15a1,1,0,0,0-2,0v6a1,1,0,0,0,.08.38,1,1,0,0,0,.54.54A1,1,0,0,0,3,22H9a1,1,0,0,0,0-2H5.41L20,5.41V9a1,1,0,0,0,2,0V3A1,1,0,0,0,21.92,2.62Z"/>
    </g>
    <g id="SVGRepo_iconCarrier" >
      <path d="M21.92,2.62a1,1,0,0,0-.54-.54A1,1,0,0,0,21,2H15a1,1,0,0,0,0,2h3.59L4,18.59V15a1,1,0,0,0-2,0v6a1,1,0,0,0,.08.38,1,1,0,0,0,.54.54A1,1,0,0,0,3,22H9a1,1,0,0,0,0-2H5.41L20,5.41V9a1,1,0,0,0,2,0V3A1,1,0,0,0,21.92,2.62Z"/>
    </g>
  </svg>
  `
    );
    return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 9 9, auto`;
  }
  
  export const treatAngle = (angle) => {
    return angle - (angle % 15);
  };
  
  const rotatationCursorIcon = (angle) => {
    const relativeAngle = angle - 90;
    const pos = {
        '-90': '9.25 5.25',
        '-75': '9.972 3.863',
        '-60': '10.84 1.756',
        '-45': '11.972 -1.716',
        '-30': '18.83 0.17',
        '-15': '28.49 -9.49',
        15: '-7.985 46.77',
        30: '-0.415 27.57',
        45: '2.32 21.713',
        60: '3.916 18.243',
        75: '4.762 16.135',
        90: '5.25 14.75',
        105: '5.84 13.617',
        120: '6.084 12.666',
        135: '6.317 12.01',
        150: '6.754 11.325',
        165: '7.06 10.653',
        180: '7.25 10',
        195: '7.597 9.43',
        210: '7.825 8.672',
        225: '7.974 7.99',
        240: '8.383 7.332',
        255: '8.83 6.441',
      },
      defaultPos = '7.25 10';
    const transform =
      relativeAngle === 0
        ? 'translate(9.5 3.5)'
        : `rotate(${relativeAngle} ${pos[relativeAngle] || defaultPos})`;
    const imgCursor = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24'>
      <defs>
        <filter id='a' width='266.7%' height='156.2%' x='-75%' y='-21.9%' filterUnits='objectBoundingBox'>
          <feOffset dy='1' in='SourceAlpha' result='shadowOffsetOuter1'/>
          <feGaussianBlur in='shadowOffsetOuter1' result='shadowBlurOuter1' stdDeviation='1'/>
          <feColorMatrix in='shadowBlurOuter1' result='shadowMatrixOuter1' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/>
          <feMerge>
            <feMergeNode in='shadowMatrixOuter1'/>
            <feMergeNode in='SourceGraphic'/>
          </feMerge>
        </filter>
        <path id='b' d='M1.67 12.67a7.7 7.7 0 0 0 0-9.34L0 5V0h5L3.24 1.76a9.9 9.9 0 0 1 0 12.48L5 16H0v-5l1.67 1.67z'/>
      </defs>
      <g fill='none' fill-rule='evenodd'><path d='M0 24V0h24v24z'/>
        <g fill-rule='nonzero' filter='url(#a)' transform='${transform}'>
          <use fill='#000' fill-rule='evenodd' xlink:href='#b'/>
          <path stroke='#FFF' d='M1.6 11.9a7.21 7.21 0 0 0 0-7.8L-.5 6.2V-.5h6.7L3.9 1.8a10.4 10.4 0 0 1 0 12.4l2.3 2.3H-.5V9.8l2.1 2.1z'/>
        </g>
      </g>
    </svg>`);
    return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`;
  };
  
  export const cursors = {
    selection_cursor: `url(${getSelectionCursor()}), auto`,
    rotation_cursor: `url(${getRotationCursor()}), auto`,
    resize_cursor: `url(${resizeCursor()}), auto`,
    resizeCursorIcon,
    rotatationCursorIcon,
  };