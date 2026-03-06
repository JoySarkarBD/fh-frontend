interface config  {
  BASE_URL:string
};


export const config:config= {
  BASE_URL:process.env.NEXT_PUBLIC_BASE_URL as string 
}