---
title: "Nova técnica computacional ajuda o Telescópio Webb na deteção de exoplanetas"
titleEn: "New computational technique helps the Webb Telescope detect exoplanets"
titleEs: "Nueva técnica computacional ayuda al Telescopio Webb a detectar exoplanetas"
excerpt: "O método FLIP cria um «gémeo digital» do JWST e melhora a sensibilidade até 15 vezes, revelando o planeta 51 Eridani b em dados onde antes era invisível."
excerptEn: "The FLIP method creates a “digital twin” of JWST and improves sensitivity by up to 15 times, revealing the planet 51 Eridani b in data where it was previously invisible."
excerptEs: "El método FLIP crea un «gemelo digital» del JWST y mejora la sensibilidad hasta 15 veces, revelando el planeta 51 Eridani b en datos donde antes era invisible."
source: "Universidade Northwestern / Nature / CCVAlg"
sourceUrl: "https://www.ccvalg.pt/astronomia/noticias/2026/11/10_exoplaneta_flip_webb.htm"
sourceType: "sci"
date: "2026-11-10"
image: "https://cdn.imgchest.com/files/208c7e6d7cc3.jpg"
imageCredit: "Rodrigo Ferrer-Chavez"
aiGenerated: false
humanReviewed: true
---

Mesmo os telescópios mais potentes do mundo têm os seus pontos cegos.

Embora o Telescópio Espacial James Webb consiga observar milhares de milhões de anos no passado, ainda tem dificuldade em fotografar planetas que orbitam estrelas próximas. As estrelas têm um brilho tão extraordinário que o seu resplendor ofusca o brilho fraco dos planetas próximos.

Agora, uma equipa de astrofísicos liderada pela Universidade Northwestern desenvolveu uma nova técnica computacional que elimina esse brilho - revelando planetas anteriormente ocultos.

Ao combinar modelação baseada na física com técnicas normalmente utilizadas na aprendizagem de máquina, o novo método tem em conta pequenas imperfeições no telescópio que interferem com a sua capacidade de detetar objetos pouco luminosos. Quando a equipa aplicou o seu método às observações existentes do Webb, melhorou a sensibilidade do telescópio em até 15 vezes. Depois do novo método ter eliminado o brilho, revelou um exoplaneta gigante numa imagem em que o processamento convencional simplesmente não o conseguia ver.

Este avanço poderá permitir aos astrónomos descobrir planetas mais pequenos, mais frios e mais ténues sem alterarem os próprios telescópios.

O estudo foi publicado dia 4 de novembro na revista Nature.

"Os planetas são um milhão de vezes mais ténues do que as suas estrelas", afirmou Rodrigo Ferrer-Chavez, da Northwestern, que liderou o estudo. "Por isso, para obter imagens de exoplanetas, precisamos de eliminar esse brilho. Trata-se de um problema muito complexo, porque mesmo as mais pequenas alterações no telescópio podem afetar a forma como esse brilho se manifesta. Pequenos desvios ou inclinações - mesmo na ordem de apenas alguns nanómetros - podem alterar o padrão da luz. O nosso método simula a forma como a luz se propaga através do telescópio e tem em conta essas minúsculas alterações, permitindo-nos eliminar o brilho de forma muito mais precisa".

Ferrer-Chavez é doutorando em astronomia na Faculdade de Artes e Ciências Weinberg da Northwestern, onde integra o grupo de investigação de Jason Wang. Wang é professor assistente de física e astronomia na Weinberg e coautor do estudo. Wang e Ferrer-Chavez são membros do CIERA (Center for Interdisciplinary Exploration and Research in Astrophysics).

Escondido num mar de luz estelar

Fotografar um planeta para lá do nosso Sistema Solar é um pouco como tentar avistar um pirilampo a pairar junto a um holofote ofuscante. Mesmo os planetas gigantes jovens relativamente brilhantes podem ser 100.000 vezes mais fracos do que as suas estrelas hospedeiras.

Para enfrentar este desafio, telescópios como o Webb utilizam instrumentos especializados chamados coronógrafos, que bloqueiam a luz das estrelas para detetar objetos pouco luminosos. Mas bloquear a estrela não é suficiente. Parte da luz da estrela continua a infiltrar-se, produzindo um padrão difuso que pode ocultar os planetas. Por isso, os astrónomos recorrem a técnicas de processamento de imagem para remover o brilho residual.

"Nos últimos 20 anos, os astrónomos têm enfrentado este problema observando uma estrela diferente e utilizando a sua imagem como referência", explicou Wang. "Em seguida, subtraem essa imagem de referência da observação original para remover o brilho indesejado e revelar planetas pouco luminosos que, de outra forma, poderiam ficar ocultos".

Eliminando a oscilação da imagem

O problema é que nenhum telescópio consegue permanecer perfeitamente imóvel. Alterações quase impercetíveis na estrutura física do telescópio alteram os padrões da luz estelar dispersa. Como resultado, a imagem de referência nunca corresponde perfeitamente à observação real. Mesmo a mais ligeira discrepância pode deixar para trás brilho suficiente para esconder um planeta pouco brilhante.

"Procuramos tornar os telescópios extremamente estáveis, mas existem desafios de engenharia extremos que ainda não conseguimos resolver totalmente", afirmou Wang. "Existem causas conhecidas de instabilidade e causas desconhecidas. Pequenas variações térmicas podem fazer com que um espelho se expanda ou contraia um picómetro. Telescópios como o Webb têm refrigeradores criogénicos para manter o instrumento a temperaturas extremamente baixas. Esses refrigeradores têm pequenos motores que podem fazer com que os espelhos vibrem. Portanto, existem problemas como esses, mas também problemas que ainda não compreendemos à medida que aprendemos a construir estes telescópios complexos".

Em vez de se basear apenas em fotografias de referência, a equipa da Northwestern adotou uma abordagem diferente. O seu novo método, denominado FLIP (Physics-based Learning for Imaging Planets), cria um "gémeo digital" do telescópio - uma réplica virtual que simula a forma como a luz estelar viaja através dos espelhos do telescópio e chega aos seus detetores.

Utilizando técnicas computacionais semelhantes às empregadas no treino de modelos de IA, a equipa ajustou minuciosamente milhões de parâmetros no gémeo digital para ter em conta minúsculas imperfeições no telescópio, incluindo desvios subtis na posição e distorções na sua ótica. Em vez de utilizar a IA para identificar planetas, os investigadores combinaram o seu conhecimento da física do telescópio com poderosas ferramentas de otimização.

"Utilizámos as mesmas ferramentas computacionais que os investigadores utilizam para treinar modelos de IA, mas, na verdade, não utilizámos IA", afirmou Wang. "Como já conhecemos a física, não precisamos da IA para compreender o que está a acontecer".

Ao ajustar repetidamente o gémeo digital até este corresponder de forma precisa à observação real do telescópio, o FLIP recriou a luz estelar indesejada com uma precisão notável. Os investigadores subtraíram então esse brilho simulado da imagem.

Revelando um planeta anteriormente oculto

Para testar a sua abordagem, os investigadores reanalisaram observações anteriores do JWST. Examinaram observações de duas estrelas - HIP 65426 e 51 Eridani - com planetas conhecidos, bem como de uma terceira estrela, TYC 5899, sem companheiros planetários conhecidos.

Em todas as observações, o FLIP superou consistentemente as técnicas convencionais de processamento de imagem, melhorando a sensibilidade para a deteção de planetas pouco brilhantes entre 2 e 15 vezes. Com a maior sensibilidade, a equipa detetou 51 Eridani b, um exoplaneta gigante anteriormente descoberto, escondido em dados do Webb com dois anos. O dióxido de carbono na atmosfera do planeta absorveu a luz no comprimento de onda infravermelho observado pelo JWST, tornando o sinal do planeta ainda mais fraco.

Embora os astrónomos já tivessem descoberto 51 Eridani b com telescópios terrestres, o processamento convencional de imagens não conseguia distingui-lo do brilho residual no comprimento de onda que o Webb utiliza para estudar o dióxido de carbono nas atmosferas planetárias. Quando Ferrer-Chavez aplicou o FLIP às mesmas observações, o planeta tornou-se visível.

"Demonstrámos que conseguimos, de facto, identificar um planeta que anteriormente não era possível ver", afirmou Wang. "Trata-se de dados reais num cenário real. Era ciência que ficava por explorar porque não dispúnhamos das ferramentas adequadas para analisar os dados da forma mais otimizada".

A mesma característica que torna um planeta mais difícil de detetar também pode torná-lo mais interessante de estudar. O JWST consegue realizar observações sensíveis a 4,3 micrómetros, onde o dióxido de carbono absorve fortemente a luz infravermelha. A deteção de características neste comprimento de onda pode, potencialmente, dar aos astrónomos novas pistas sobre a atmosfera e a composição de um planeta.

De planetas gigantes a mundos semelhantes à Terra

Por enquanto, Ferrer-Chavez e Wang esperam que o FLIP ajude os astrónomos a descobrir planetas anteriormente ocultos nas observações existentes. Ao remover a luz das estrelas com maior precisão, o método também poderá permitir aos cientistas estudar planetas em diferentes comprimentos de onda para revelar novas pistas sobre as suas atmosferas.

Olhando mais para o futuro, o FLIP poderá ajudar a moldar a próxima geração de telescópios dedicados à procura de planetas. O HWO (Habitable Worlds Observatory), proposto pela NASA, tem como objetivo fotografar diretamente planetas semelhantes à Terra que orbitam estrelas distantes semelhantes ao Sol. Para encontrar planetas tão pequenos, o telescópio poderá ter de manter a estabilidade ótica à escala do picómetro. Isso equivale a bilionésimos de metro ou, aproximadamente, 100 a 1000 vezes mais estável do que o Webb.

O FLIP oferece um caminho potencialmente diferente para o futuro. Em vez de dependerem de soluções de engenharia para manter um telescópio perfeitamente estável, os astrónomos poderão ser capazes de corrigir as suas minúsculas imperfeições.

"Não conhecemos nenhum planeta em torno de outras estrelas que seja semelhante aos do nosso próprio Sistema Solar", afirmou Ferrer-Chavez. "Não é que não existam. É que não os conseguimos ver. Sempre que melhoramos as nossas técnicas, descobrimos novos tipos de planetas. Ao encontrar mais planetas, podemos compreender melhor como os sistemas planetários se formam e evoluem e, em última análise, até que ponto o nosso próprio Sistema Solar é realmente típico".

<!--lang:en-->

Even the world’s most powerful telescopes have their blind spots.

Although the James Webb Space Telescope can look billions of years into the past, it still struggles to photograph planets orbiting nearby stars. Stars are so extraordinarily bright that their glare overwhelms the faint glow of nearby planets.

Now, a team of astrophysicists led by Northwestern University has developed a new computational technique that removes that glare — revealing previously hidden planets.

By combining physics-based modelling with techniques normally used in machine learning, the new method accounts for tiny imperfections in the telescope that interfere with its ability to detect faint objects. When the team applied their method to existing Webb observations, they improved the telescope’s sensitivity by up to 15 times. After the new method removed the glare, it revealed a giant exoplanet in an image where conventional processing simply could not see it.

This advance could allow astronomers to discover smaller, colder and fainter planets without changing the telescopes themselves.

The study was published on 4 November in the journal Nature.

"Planets are a million times fainter than their stars," said Rodrigo Ferrer-Chavez of Northwestern, who led the study. "So to image exoplanets, we need to remove that glare. It is a very complex problem, because even the tiniest changes in the telescope can affect how that glare appears. Small shifts or tilts — even on the order of just a few nanometres — can change the light pattern. Our method simulates how light propagates through the telescope and accounts for those tiny changes, allowing us to remove the glare much more precisely."

Ferrer-Chavez is a doctoral student in astronomy in Northwestern’s Weinberg College of Arts and Sciences, where he is part of Jason Wang’s research group. Wang is an assistant professor of physics and astronomy in Weinberg and co-author of the study.

Hidden in a sea of starlight

Photographing a planet beyond our Solar System is a bit like trying to spot a firefly hovering next to a blinding spotlight. Even relatively bright young giant planets can be 100,000 times fainter than their host stars.

To meet this challenge, telescopes like Webb use specialised instruments called coronagraphs, which block starlight to detect faint objects. But blocking the star is not enough. Some of the star’s light still leaks through, producing a diffuse pattern that can hide planets. So astronomers turn to image-processing techniques to remove the residual glare.

"For the past 20 years, astronomers have tackled this problem by observing a different star and using its image as a reference," explained Wang. "Then they subtract that reference image from the original observation to remove the unwanted glare and reveal faint planets that might otherwise remain hidden."

Removing the image wobble

The problem is that no telescope can remain perfectly still. Almost imperceptible changes in the telescope’s physical structure alter the patterns of scattered starlight. As a result, the reference image never matches the real observation perfectly. Even the slightest discrepancy can leave enough glare behind to hide a faint planet.

Instead of relying only on reference photographs, the Northwestern team took a different approach. Their new method, called FLIP (Physics-based Learning for Imaging Planets), creates a “digital twin” of the telescope — a virtual replica that simulates how starlight travels through the telescope’s mirrors and reaches its detectors.

Using computational techniques similar to those employed in training AI models, the team finely tuned millions of parameters in the digital twin to account for tiny imperfections in the telescope, including subtle shifts in position and distortions in its optics.

By repeatedly adjusting the digital twin until it matched the real telescope observation precisely, FLIP recreated the unwanted starlight with remarkable accuracy. The researchers then subtracted that simulated glare from the image.

Revealing a previously hidden planet

To test their approach, the researchers reanalysed previous JWST observations. They examined observations of two stars — HIP 65426 and 51 Eridani — with known planets, as well as a third star, TYC 5899, with no known planetary companions.

Across all observations, FLIP consistently outperformed conventional image-processing techniques, improving sensitivity for detecting faint planets by a factor of 2 to 15. With the increased sensitivity, the team detected 51 Eridani b, a previously discovered giant exoplanet hidden in two-year-old Webb data.

"We showed that we can actually recover a planet that people previously couldn’t see," said Wang. "This is real data in a real scenario. It was science left on the table because we didn’t have the right tools to analyse the data in the most optimal way."

<!--lang:es-->

El método FLIP crea un «gemelo digital» del JWST y mejora la sensibilidad hasta 15 veces. Reveló el planeta 51 Eridani b en datos donde el procesamiento convencional no podía verlo.