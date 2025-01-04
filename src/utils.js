export const status = async response => {
  console.log('Response status:', response.status);
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  } else {
    const error = await response.json();
    console.log('Error details:', error);
    throw error;
  }
}