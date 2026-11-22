---
title: "Novo algoritmo encontra pulsares de raios gama um milhão de vezes mais depressa"
titleEn: "Finding gamma-ray pulsars a million times faster"
titleEs: "Nuevo algoritmo encuentra púlsares de rayos gamma un millón de veces más rápido"
excerpt: "Método inspirado em criptografia descobriu o pulsar PSR J1622−7204 (261 rotações/s) em dados de 15 anos do Fermi com apenas ~10 horas de CPU."
excerptEn: "A cryptography-inspired method discovered pulsar PSR J1622−7204 (261 spins/s) in 15 years of Fermi data with only ~10 CPU hours."
excerptEs: "Un método inspirado en criptografía descubrió el púlsar PSR J1622−7204 (261 giros/s) en 15 años de datos de Fermi con solo ~10 horas de CPU."
source: "Max Planck / Weizmann / Physical Review Letters"
sourceUrl: "https://www.aei.mpg.de/1483164/finding-gamma-ray-pulsars-a-million-times-faster"
sourceType: "sci"
date: "2026-11-22"
image: "https://www.aei.mpg.de/1483460/original-1786529695.jpg"
imageCredit: "B. Knispel, Max Planck Institute for Gravitational Physics; NASA/DOE/Fermi LAT Collaboration"
aiGenerated: false
humanReviewed: true
---

Uma equipa internacional de cientistas do Instituto Max Planck de Física Gravitacional (Instituto Albert Einstein; AEI) em Hannover, Alemanha, do Instituto Weizmann de Ciência em Rehovot, Israel, e da Universidade Chalmers em Gotemburgo, Suécia, descobriu um novo pulsar de raios gama usando um método cerca de um milhão de vezes mais rápido do que os anteriores. Os resultados foram publicados a 19 de novembro de 2026 na revista Physical Review Letters.

Usando um método que os coautores do estudo Dotan Gazith e Barak Zackay, do Instituto Weizmann de Ciência, derivaram da investigação em criptografia, a equipa descobriu o pulsar PSR J1622−7204 — que roda 261 vezes por segundo — em 15 anos de dados do Telescópio de Grande Área (LAT) do Fermi da NASA. Para isso, os cientistas precisaram apenas do equivalente a cerca de 10 horas de tempo de cálculo num único núcleo de CPU padrão. Isto é extremamente rápido: o método anterior mais sensível e eficaz não conseguiu detetar o pulsar, apesar de exigir tanta potência de cálculo que um único núcleo de CPU teria demorado 600 anos a completar a análise. Os investigadores pretendem agora procurar nos dados públicos do Fermi LAT mais exemplos destes objetos de rotação rápida. Também planeiam procurar pulsares de raios gama em sistemas binários. Isso exige novamente recursos computacionais significativamente maiores.

Um pulsar é uma estrela de neutrões em rotação rápida. Como um farol cósmico, emite feixes de radiação na direção da Terra. Lançado em 2008, o satélite Fermi observa o Universo em raios gama — a forma de luz de maior energia. Faz o levantamento de todo o céu a cada três horas.

Detetar pulsares nos dados de raios gama do satélite é extremamente difícil. Isto porque o Fermi captura apenas uma fração minúscula dos fotões de um determinado pulsar. Além disso, estes fotões do pulsar estão enterrados num fundo de fotões de outras fontes celestes não relacionadas.

Para encontrar um sinal, os investigadores têm de determinar com precisão várias incógnitas ao mesmo tempo: quão rápido a estrela roda, quão depressa a sua rotação está a abrandar e precisamente onde se encontra no céu. Explorar e procurar todas as combinações possíveis exigiria um número vasto de cálculos.

«Não vemos todas as rotações do pulsar e não podemos simplesmente contar as rotações para descobrir de onde veio o fotão», afirma Daniel Pook-Kolb, cientista do Instituto Max Planck de Física Gravitacional em Hannover, Alemanha, que co-desenvolveu o novo método de pesquisa. «Temos uma grelha de quatro dimensões e temos de procurar cada direção com milhões de tentativas. Simplesmente não há potência de cálculo suficiente na Terra para o fazer.»

Até agora, os cientistas procuravam estes pulsares dividindo os dados do Fermi em pedaços mais pequenos e analisando-os com o projeto de computação voluntária distribuída Einstein@Home. Desta forma, descobriram até agora mais de 80 novos pulsares. No entanto, mesmo com a potência de cálculo do Einstein@Home, demorava tipicamente o equivalente a centenas de anos-computador para identificar um único pulsar.

Gazith e Zackay, do Instituto Weizmann de Ciência, descobriram que a procura de pulsares de raios gama é essencialmente um problema geométrico: como determinar o vetor mais curto numa rede — uma disposição regular de pontos — com muitas dimensões? A técnica baseia-se em algoritmos desenvolvidos por criptógrafos para quebrar sistemas de encriptação — especificamente aqueles concebidos para resistir à quebra de códigos por futuros computadores quânticos.

«Não temos nada a ver com criptografia na nossa análise aqui, mas esses algoritmos podem ajudar-nos a resolver o problema de procurar pulsares nos nossos dados», afirma Dotan Gazith, estudante de doutoramento no Departamento de Física de Partículas e Astrofísica do Instituto Weizmann de Ciência.

Os investigadores começaram por realizar testes do algoritmo. Selecionaram apenas 80 fotões de raios gama de entre todos os que tinham maior probabilidade de ter origem no pulsar. Cada teste demorava cerca de cinco minutos num único núcleo de processador. Isto é facilmente alcançável mesmo num portátil padrão, que tipicamente tem entre dois e oito núcleos. Assim que um candidato a pulsar era identificado, os investigadores liam o conjunto completo de dados do Fermi contendo todos os fotões gama do pulsar. Isto revelou um sinal muito forte, confirmando a descoberta de um novo pulsar.

O próximo objetivo da equipa é ainda mais ambicioso: a procura de pulsares em sistemas estelares binários, onde um pulsar e uma estrela orbitam em torno do seu centro de massa comum. Tais descobertas eram há muito consideradas impossíveis, pois o movimento do pulsar distorce o sinal de uma forma que os métodos convencionais não conseguem ter em conta.

«Sabemos que há provavelmente dezenas ou talvez mesmo centenas destes pulsares no conjunto de dados que simplesmente não conseguimos encontrar», afirma Clark, líder de grupo no AEI e coautor do estudo. «O próximo objetivo é alargar as pesquisas e usar a combinação do novo algoritmo e da potência de cálculo partilhada pelos voluntários do nosso programa Einstein@Home para, esperamos, encontrar muitos novos pulsares que pensamos que devem estar lá.»

<!--lang:en-->

An international team has discovered a new gamma-ray pulsar using a method about a million times faster than before. The results appeared in Physical Review Letters on 19 November 2026.

Using algorithms derived from cryptography, the team found PSR J1622−7204 — spinning 261 times per second — in 15 years of NASA Fermi LAT data. The search needed only about 10 hours on a single CPU core; previous methods would have required centuries of CPU time and still failed to detect the pulsar.

Detecting gamma-ray pulsars is hard because Fermi captures only a tiny fraction of the photons, buried in background. The new method treats the problem as finding the shortest vector in a high-dimensional lattice — techniques originally developed to attack post-quantum cryptography.

The team now plans to search for many more gamma-ray pulsars, including those in binary systems that were previously considered almost impossible to find, combining the new algorithm with the Einstein@Home volunteer computing project.

<!--lang:es-->

Un método inspirado en criptografía descubrió el púlsar de rayos gamma PSR J1622−7204 (261 giros por segundo) en 15 años de datos de Fermi con solo ~10 horas de CPU — un millón de veces más rápido que los métodos anteriores.