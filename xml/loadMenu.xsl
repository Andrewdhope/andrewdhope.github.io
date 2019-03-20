<?xml version="1.0" encoding="UTF-8"?>
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="content">
	<ul>
		<xsl:for-each select="section">
			<xsl:element name="li">
				<xsl:attribute name="class">menulist</xsl:attribute>
				<xsl:element name="a">
					<xsl:attribute name="href">#</xsl:attribute>
					<xsl:attribute name="onclick">ajaxLoad(xmlpath,buildContent,xslpath,['<xsl:value-of select="@option" />']);selectedMenu('<xsl:value-of select="@option" />')</xsl:attribute>
					<xsl:value-of select="@option" />
				</xsl:element>
			</xsl:element>
				
		</xsl:for-each>
	</ul>
</xsl:template>
</xsl:transform>