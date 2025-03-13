const sheetUrls = {
  sheet1: "https://docs.google.com/spreadsheets/d/1K2Emi5_yafsM6eJh3C-QETRbN9bo0vbWywaHI_EDeRA/export?format=csv",
};

let currentVoucher = null;

async function fetchData(sheetKey, inputId) {
  const voucherCode = document.getElementById(inputId).value.trim();
  if (!voucherCode) {
    Swal.fire({
      icon: "warning",
      title: "Empty Field!",
      text: "Please enter a voucher code.",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  // Check if the voucher is already claimed
  const claimedVouchers = JSON.parse(localStorage.getItem("claimedVouchers")) || [];
  if (claimedVouchers.includes(voucherCode)) {
    Swal.fire({
      icon: "error",
      title: "Voucher Already Claimed!",
      text: "This voucher has already been claimed.",
      confirmButtonColor: "#d33",
    });
    return;
  }

  // Add a timestamp to force fresh data fetch
  const url = `${sheetUrls[sheetKey]}&t=${Date.now()}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const csvData = await response.text();
    const rows = csvData.split("\n").slice(1).map(row => row.split(",").map(cell => cell.trim()));

    // Find the voucher code in the CSV data (assuming it's in the 6th column)
    const foundRow = rows.find(row => row.length > 5 && row[5] === voucherCode);

    if (foundRow) {
      const [timestamp, name, email, reward, screenshot, voucherCode, expiryDate, status] = foundRow;

      currentVoucher = voucherCode;

      Swal.fire({
        title: "Voucher Found!",
        html: `
          <p><strong>Name:</strong> ${name || "N/A"}</p>
          <p><strong>Email:</strong> ${email || "N/A"}</p>
          <p><strong>Reward:</strong> ${reward || "N/A"}</p>
          <p><strong>Expiry Date:</strong> ${expiryDate || "N/A"}</p>
          <p><strong>Status:</strong> ${status || "N/A"}</p>
        `,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Claim Reward",
        cancelButtonText: "Close",
        confirmButtonColor: "#28a745",
      }).then((result) => {
        if (result.isConfirmed) {
          claimReward();
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Not Found!",
        text: "Voucher code not found.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      icon: "error",
      title: "Network Error!",
      text: "Failed to fetch data. Please try again.",
      confirmButtonColor: "#d33",
    });
  }
}

function claimReward() {
  if (currentVoucher) {
    let claimedVouchers = JSON.parse(localStorage.getItem("claimedVouchers")) || [];

    if (claimedVouchers.includes(currentVoucher)) {
      Swal.fire({
        icon: "error",
        title: "Already Claimed!",
        text: "This voucher has already been claimed.",
        confirmButtonColor: "#d33",
      });
    } else {
      claimedVouchers.push(currentVoucher);
      localStorage.setItem("claimedVouchers", JSON.stringify(claimedVouchers));

      Swal.fire({
        icon: "success",
        title: "Reward Claimed!",
        text: "Your reward has been successfully claimed.",
        confirmButtonColor: "#28a745",
      });

      currentVoucher = null;
    }
  } else {
    Swal.fire({
      icon: "warning",
      title: "No Voucher Selected!",
      text: "Please fetch voucher details before claiming.",
      confirmButtonColor: "#3085d6",
    });
  }
}
