const { spawn } = require('child_process');

const mcp = spawn('node', ['tesserin-mcp/dist/index.js'], { 
  env: { 
    ...process.env,
    TESSERIN_API_TOKEN: 'tsk_3089df19cd75b6762d18fd6d73b0f3ac76a006a0bee750ed474ae174d770faf7', 
    TESSERIN_API_URL: 'http://127.0.0.1:9960' 
  } 
});

let outText = '';

mcp.stdout.on('data', d => {
  outText += d.toString();
  console.log('OUT:', d.toString());
});
mcp.stderr.on('data', d => console.log('ERR:', d.toString()));

const req = { 
  jsonrpc: "2.0", 
  id: 1, 
  method: "tools/call", 
  params: { 
    name: "create_note", 
    arguments: { 
      title: "Alliance University Bangalore", 
      content: "# Alliance University Bangalore\n\n- **Status**: Established in 2010; the first private university in South India.\n- **Accreditation**: NAAC A+ Grade.\n- **Key Schools**:\n  - **Business**: MBA (FinTech, Digital Transformation), BBA, B.Com.\n  - **Engineering**: B.Tech (CSE, IT, Mech, EEE, ECE), M.Tech.\n  - **Law**: BA LLB, BBA LLB, LLM (#20 in NIRF 2025).\n- **Locations**:\n  - **Main Campus**: Anekal (60-acre residential campus).\n  - **City Campus**: BTM Layout.\n- **Placements**: Highest package of ₹60.1 LPA (2025) with recruiters like Deloitte and Goldman Sachs."
    } 
  } 
};

mcp.stdin.write(JSON.stringify(req) + "\n");

setTimeout(() => mcp.kill(), 2000);
