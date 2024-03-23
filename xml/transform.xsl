<?xml version="1.0" encoding="UTF-8"?>
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:param name="sectionVal" />
<xsl:template match="content">

<xsl:for-each select="intro[@option = $sectionVal]/blurb">
	<xsl:element name="p">
		<xsl:attribute name="class">blurb</xsl:attribute>
		<xsl:if test="@option='quote'">
			<xsl:attribute name="class">quote</xsl:attribute>
		</xsl:if>
		<xsl:if test="@option='attrib'">
			<xsl:attribute name="class">attrib</xsl:attribute>
		</xsl:if>
		<xsl:value-of select="normalize-space(text())"/> 
	</xsl:element>
</xsl:for-each>
<xsl:for-each select="section[@option = $sectionVal]/bullet">
	<!-- element IDs shouldn't contain spaces, use translate to remove them with XSLT 1.0 -->
	<xsl:variable name="bullet" select="translate(normalize-space(title/text()),' ','_')" />
	<div class="bullet" id="{$bullet}">
		<!-- assign a class (collapsible, empty) based on whether there is content under this bullet -->
		<xsl:element name="h2">
			<xsl:if test="count(line) = 0">
				<xsl:attribute name="class">empty</xsl:attribute>
			</xsl:if>
			<xsl:if test="count(line) > 0">
				<xsl:attribute name="class">collapsible</xsl:attribute>
			</xsl:if>
			<xsl:attribute name="onclick">
				<xsl:text>expandBullet('</xsl:text><xsl:value-of select="$bullet" />
				<xsl:if test="@auto-expand > -1"> 
					<xsl:text>','</xsl:text><xsl:value-of select="@auto-expand" />
				</xsl:if>
				<xsl:text>')</xsl:text>
			</xsl:attribute>
			<xsl:value-of select="title"/> <!-- actual value of the header -->
		</xsl:element>
		
		<xsl:if test="count(line) > 0">
			<span class="material-icons">expand_more</span>
		</xsl:if>
		
		<div class="lineset">
			
			<!-- add either the horiz or vert class based on the bullet's attribute value -->
			<xsl:if test="@list-orientation='vert'">
				<xsl:attribute name="class">lineset vert</xsl:attribute>
			</xsl:if>
			<xsl:if test="@list-orientation='horiz'">
				<xsl:attribute name="class">lineset horiz</xsl:attribute>
			</xsl:if>
			
			<!-- substitute a paragraph when there are no links and just a writeup -->
			<xsl:if test="count(writeup) > 0">
				<xsl:element name="a">
					<xsl:attribute name="class">writeup</xsl:attribute>
					<xsl:value-of select="normalize-space(writeup/text())"/> 
				</xsl:element>
			</xsl:if>
			
		<xsl:for-each select="line">
			<!-- element IDs shouldn't contain spaces, use translate to remove them with XSLT 1.0 -->
			<xsl:variable name="line" select="translate(normalize-space(text()),' ','_')" />
			

			<div class="line" id="{$line}">
				<!-- assign a class (collapsible, empty) based on whether there is content under this line -->
				<xsl:element name="h3">
					<xsl:if test="count(entry) = 0">
						<xsl:attribute name="class">empty</xsl:attribute>
					</xsl:if>
					<xsl:if test="count(entry) > 0">
						<xsl:attribute name="class">collapsible</xsl:attribute>
						<xsl:attribute name="onclick">
							<xsl:text>expandLine('</xsl:text><xsl:value-of select="$line" /><xsl:text>')</xsl:text>
						</xsl:attribute>
					</xsl:if>
					
					<!-- value of the header when it is not a standalone link -->
					<xsl:if test="count(link[1]) = 0">
						<xsl:value-of select="normalize-space(text())"/> 
					</xsl:if>
					
					<!-- add an option for the line-header to be a standalone link -->
					<xsl:if test="count(link[1]) = 1">
						<xsl:element name="a">
							<xsl:attribute name="href">
								<xsl:value-of select="normalize-space(link/text())" />
							</xsl:attribute>
							<xsl:attribute name="target">
								<xsl:text>"_blank"</xsl:text>
							</xsl:attribute>
							<xsl:value-of select="normalize-space(text())" />
						</xsl:element>
					</xsl:if>
				</xsl:element>
			
				<xsl:if test="count(entry) > 0">
					<span class="material-icons">expand_more</span>
				</xsl:if>
				
				<!-- when the linkset is directly under the line (no entry) -->
				<xsl:if test="count(linkset[1]) = 1">
					<xsl:for-each select="linkset/link">
						<xsl:variable name="i" select="position()"/>
						<xsl:element name="a">
							<xsl:attribute name="class">
								<xsl:text>multi-entry</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="href">
								<xsl:value-of select="normalize-space(text())" />
							</xsl:attribute>
							<xsl:attribute name="target">
								<xsl:text>"_blank"</xsl:text>
							</xsl:attribute>
							<xsl:text>[</xsl:text><xsl:value-of select="$i" /><xsl:text>]</xsl:text>
						</xsl:element>
					</xsl:for-each>
				</xsl:if>
				
			</div> <!-- .line -->
			
			<xsl:if test="count(entry) > 0">
				<div class="entryset">
					
					<!-- set vertical or horizontal orientation for the dropdown list -->
					<xsl:if test="../@list-orientation='vert'">
						<xsl:attribute name="class">entryset vert</xsl:attribute>
					</xsl:if>
					<xsl:if test="../@list-orientation='horiz'">
						<xsl:attribute name="class">entryset horiz</xsl:attribute>
					</xsl:if>
								
					<xsl:for-each select="entry">				
						<div class="entry">
							<xsl:choose>
								<!-- entries with one link -->
								<xsl:when test="count(link) = 1">
									<xsl:element name="a">
										<xsl:attribute name="href">
											<xsl:value-of select="normalize-space(link/text())" />
										</xsl:attribute>
										<xsl:attribute name="target">
											<xsl:text>"_blank"</xsl:text>
										</xsl:attribute>
										<xsl:value-of select="normalize-space(text())" />
									</xsl:element>
								</xsl:when>
								
								<!-- entries with multiple links -->
								<xsl:when test="count(linkset) = 1">
									<!-- entry name -->
									<span class="multi-entry"><xsl:value-of select="normalize-space(text())" /></span>
									<!-- set of links --> 
									<xsl:for-each select="linkset/link">
										<xsl:variable name="i" select="position()"/>
										<xsl:element name="a">
											<xsl:attribute name="class">
												<xsl:text>multi-entry</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="href">
												<xsl:value-of select="normalize-space(text())" />
											</xsl:attribute>
											<xsl:attribute name="target">
												<xsl:text>"_blank"</xsl:text>
											</xsl:attribute>
											<xsl:text>[</xsl:text><xsl:value-of select="$i" /><xsl:text>]</xsl:text>
										</xsl:element>
									</xsl:for-each>
								</xsl:when>
							
								<!-- entries without links -->
								<xsl:otherwise>
									<span class="nolink"><xsl:value-of select="normalize-space(text())" /></span>
								</xsl:otherwise>
							</xsl:choose>
							
							<!-- roles -->
							<xsl:if test="count(role) = 1">
								<span class="role"><xsl:value-of select="normalize-space(role/text())" /></span>
							</xsl:if>
							<!-- in some cases we want the roles in their own div below the entry name -->
							<xsl:if test="(count(role) &gt; 1) or ((linkwrap) and (role))">
								<div class="role-wrap">
									<xsl:for-each select="role">
										<span class="role"><xsl:value-of select="normalize-space(text())" /></span>
									</xsl:for-each>
								</div>
							</xsl:if>
							
							<!-- value-dates -->
							<xsl:if test="count(value) = 1">
								<span class="value"><xsl:value-of select="normalize-space(value/text())" /></span>
								<span class="date"><xsl:value-of select="normalize-space(date/text())" /></span>
							</xsl:if>
							
							<!-- details -->
							<xsl:for-each select="detail">
								<sup><xsl:value-of select="normalize-space(text())" /></sup>
							</xsl:for-each>	
						</div>
					</xsl:for-each>
				</div>
			</xsl:if>
		</xsl:for-each>
		</div>
	</div>
</xsl:for-each>
</xsl:template>
</xsl:transform>