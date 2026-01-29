import { Help } from '@oclif/core';

const BANNER = `
                 ::::                                            
           :::::  .::                                           
      .:::::::::::: ::                                          
    .::      :       ::          ::: :::                         
   ::::      ::  ::::::          ::: :::                         
  .:::::     ::::     ::         :::     ::: :::::     :::::  .: 
  ::::.::::::: ::      ::        ::: ::: ::::::::::  :::::.::::: 
  :::::::       :     ::::       ::: ::: :::     ::: ::      ::: 
   :::::::      .:.:::::::       ::: ::: :::     ::: ::      .:: 
    ::::::: .::::::::::::        ::: ::: :::     ::: ::.     ::: 
    :::::::::::::::::::::        ::: ::: :::     ::: ::::::::::: 
     :::::::::::::::::::                               :::  ::: 
      :::::::::::::::                                       ::: 
       :::::::::.                                            :: 
        ::::                                                    
  
  Linq CLI for iMessage & SMS
`;

export default class LinqHelp extends Help {
  async showRootHelp(): Promise<void> {
    console.log(BANNER);
    await super.showRootHelp();
  }
}
